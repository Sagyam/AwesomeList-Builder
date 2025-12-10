/**
 * Build-time data fetching script (Refactored)
 * Fetches metadata from GitHub/GitLab and updates YAML files directly
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import type {Library} from "@/schema/ts/library.interface.ts";
import type {Paper} from "@/schema/ts/paper.interface.ts";
import type {Repository} from "@/schema/ts/repository.interface.ts";
import type {Resource} from "@/schema/ts/types.ts";
import {arxivClient} from "./arxiv-client.ts";
import {githubClient} from "./github-client.ts";
import {gitlabClient} from "./gitlab-client.ts";

export interface FetchStats {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
}

interface MetadataConfig {
  dataRefresh?: {
    enabled: boolean;
    intervalDays: number;
    lastRefresh: string | null;
  };
}

export class MetadataFetcher {
  private stats: FetchStats = {
    total: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  /**
   * Fetch and update all resources
   */
  async fetchAll(resourcesDir: string, force = false): Promise<void> {
    console.log("Loading metadata configuration...");
    const metadataPath = path.join(path.dirname(resourcesDir), "metadata.yaml");
    const metadata = this.loadMetadata(metadataPath);

    // Check if refresh is needed based on ISR logic
    if (!force && !this.shouldRefresh(metadata)) {
      console.log("Data refresh not needed. Use --force to override.");
      return;
    }

    console.log("Loading resources...");
    const resources = this.loadResources(resourcesDir);
    this.stats.total = resources.length;

    console.log(`Found ${resources.length} resources`);
    console.log("Fetching metadata from GitHub/GitLab...");

    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (resource) => {
          const updated = await this.enrichAndUpdateResource(resource, resourcesDir);
          if (updated) {
            this.stats.updated++;
          }
        })
      );

      // Progress indicator
      console.log(
        `Progress: ${i + batch.length}/${resources.length} (${Math.round(((i + batch.length) / resources.length) * 100)}%)`
      );

      // Small delay between batches
      if (i + batchSize < resources.length) {
        await this.sleep(1000);
      }
    }

    // Update lastRefresh timestamp in metadata
    this.updateMetadataTimestamp(metadataPath);

    this.printStats();
  }

  /**
   * Load metadata configuration
   */
  private loadMetadata(metadataPath: string): MetadataConfig {
    try {
      if (!fs.existsSync(metadataPath)) {
        return {};
      }
      const content = fs.readFileSync(metadataPath, "utf-8");
      return yaml.parse(content) as MetadataConfig;
    } catch (error) {
      console.warn("Failed to load metadata.yaml:", error);
      return {};
    }
  }

  /**
   * Check if data refresh is needed based on ISR configuration
   */
  private shouldRefresh(metadata: MetadataConfig): boolean {
    const config = metadata.dataRefresh;

    if (!config || !config.enabled) {
      return true; // Refresh if not configured
    }

    if (!config.lastRefresh) {
      return true; // Never refreshed before
    }

    const lastRefresh = new Date(config.lastRefresh);
    const now = new Date();
    const daysSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRefresh >= config.intervalDays;
  }

  /**
   * Update lastRefresh timestamp in metadata.yaml
   */
  private updateMetadataTimestamp(metadataPath: string): void {
    try {
      if (!fs.existsSync(metadataPath)) {
        return;
      }

      const content = fs.readFileSync(metadataPath, "utf-8");
      const metadata = yaml.parse(content);

      if (!metadata.dataRefresh) {
        metadata.dataRefresh = {
          enabled: true,
          intervalDays: 7,
          lastRefresh: null,
        };
      }

      metadata.dataRefresh.lastRefresh = new Date().toISOString();

      fs.writeFileSync(metadataPath, yaml.stringify(metadata), "utf-8");
      console.log("Updated lastRefresh timestamp in metadata.yaml");
    } catch (error) {
      console.warn("Failed to update metadata timestamp:", error);
    }
  }

  /**
   * Load all resource YAML files
   */
  private loadResources(resourcesDir: string): Resource[] {
    const resources: Resource[] = [];

    if (!fs.existsSync(resourcesDir)) {
      console.warn(`Resources directory not found: ${resourcesDir}`);
      return resources;
    }

    const files = fs.readdirSync(resourcesDir);

    for (const file of files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;

      try {
        const filePath = path.join(resourcesDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const resource = yaml.parse(content) as Resource;
        // Store the file path for later updates
        (resource as any).__filePath = filePath;
        resources.push(resource);
      } catch (error) {
        console.warn(`Failed to load resource from ${file}:`, error);
      }
    }

    return resources;
  }

  /**
   * Enrich and update a resource based on its type
   */
  private async enrichAndUpdateResource(
    resource: Resource,
    resourcesDir: string
  ): Promise<boolean> {
    try {
      let updated = false;

      switch (resource.type) {
        case "repository":
          updated = await this.enrichAndUpdateRepository(resource as Repository);
          break;
        case "library":
          updated = await this.enrichAndUpdateLibrary(resource as Library);
          break;
        case "paper":
          updated = await this.enrichAndUpdatePaper(resource as Paper);
          break;
        default:
          // Other resource types don't need enrichment
          this.stats.skipped++;
          return false;
      }

      if (updated) {
        // Write the updated resource back to its YAML file
        const filePath = (resource as any).__filePath;
        if (filePath) {
          // Remove the temporary __filePath property before saving
          delete (resource as any).__filePath;
          const content = yaml.stringify(resource);
          fs.writeFileSync(filePath, content, "utf-8");
        }
      }

      return updated;
    } catch (error) {
      console.warn(`Failed to enrich resource ${resource.id}:`, error);
      this.stats.failed++;
      return false;
    }
  }

  /**
   * Enrich a repository resource with GitHub or GitLab data
   */
  private async enrichAndUpdateRepository(resource: Repository): Promise<boolean> {
    try {
      // Determine if it's GitHub or GitLab
      const isGitHub = resource.repositoryUrl.includes("github.com");
      const isGitLab = resource.repositoryUrl.includes("gitlab.com");

      if (isGitHub) {
        const metadata = await githubClient.fetchRepositoryMetadata(resource.repositoryUrl);

        if (metadata) {
          // Update the resource with fresh data
          resource.owner = metadata.owner;
          resource.ownerUrl = metadata.ownerUrl;
          resource.homepage = metadata.homepage || resource.homepage;
          resource.license = metadata.license || resource.license;
          resource.stars = metadata.stars;
          resource.forks = metadata.forks;
          resource.watchers = metadata.watchers;
          resource.openIssues = metadata.openIssues;
          resource.openPullRequests = metadata.openPullRequests;
          resource.lastCommit = metadata.lastCommit;
          resource.lastReleaseVersion = metadata.lastReleaseVersion;
          resource.lastReleaseDate = metadata.lastReleaseDate;
          resource.created = metadata.created;
          resource.primaryLanguage = metadata.primaryLanguage || resource.primaryLanguage;
          resource.languages = metadata.languages;
          resource.archived = metadata.archived;
          resource.hasWiki = metadata.hasWiki;
          resource.hasDiscussions = metadata.hasDiscussions;
          // Merge topics from GitHub with existing tags
          resource.topics = [...new Set([...(resource.topics || []), ...metadata.topics])];

          return true;
        }
      } else if (isGitLab) {
        const metadata = await gitlabClient.fetchRepositoryMetadata(resource.repositoryUrl);

        if (metadata) {
          // Update the resource with fresh data
          resource.owner = metadata.owner;
          resource.ownerUrl = metadata.ownerUrl;
          resource.homepage = metadata.homepage || resource.homepage;
          resource.license = metadata.license || resource.license;
          resource.stars = metadata.stars;
          resource.forks = metadata.forks;
          resource.watchers = metadata.watchers;
          resource.openIssues = metadata.openIssues;
          resource.openPullRequests = metadata.openPullRequests;
          resource.lastCommit = metadata.lastCommit;
          resource.lastReleaseVersion = metadata.lastReleaseVersion;
          resource.lastReleaseDate = metadata.lastReleaseDate;
          resource.created = metadata.created;
          resource.primaryLanguage = metadata.primaryLanguage || resource.primaryLanguage;
          resource.languages = metadata.languages;
          resource.archived = metadata.archived;
          resource.hasWiki = metadata.hasWiki;
          resource.hasDiscussions = metadata.hasDiscussions;
          // Merge topics from GitLab with existing tags
          resource.topics = [...new Set([...(resource.topics || []), ...metadata.topics])];

          return true;
        }
      } else {
        console.warn(`Unsupported repository host: ${resource.repositoryUrl}`);
        this.stats.skipped++;
      }
    } catch (error) {
      console.warn(`Failed to enrich repository ${resource.repositoryUrl}:`, error);
      this.stats.failed++;
    }

    return false;
  }

  /**
   * Enrich a library resource with GitHub/GitLab data from its repository
   */
  private async enrichAndUpdateLibrary(resource: Library): Promise<boolean> {
    try {
      // Libraries should have a repository URL
      if (!resource.repository) {
        console.warn(`Library ${resource.id} has no repository URL, skipping`);
        this.stats.skipped++;
        return false;
      }

      const isGitHub = resource.repository.includes("github.com");
      const isGitLab = resource.repository.includes("gitlab.com");

      if (isGitHub) {
        const metadata = await githubClient.fetchRepositoryMetadata(resource.repository);

        if (metadata) {
          // Update the library with fresh data from its repository
          resource.homepage = metadata.homepage || resource.homepage;
          resource.license = metadata.license || resource.license;
          resource.stars = metadata.stars;
          resource.forks = metadata.forks;
          resource.watchers = metadata.watchers;
          resource.openIssues = metadata.openIssues;
          resource.openPullRequests = metadata.openPullRequests;
          resource.lastCommit = metadata.lastCommit;
          resource.lastReleaseVersion = metadata.lastReleaseVersion;
          resource.lastReleaseDate = metadata.lastReleaseDate;
          resource.created = metadata.created;
          resource.languages = metadata.languages;
          resource.archived = metadata.archived;
          resource.hasWiki = metadata.hasWiki;
          resource.hasDiscussions = metadata.hasDiscussions;
          // Merge topics
          resource.topics = [...new Set([...(resource.topics || []), ...metadata.topics])];

          return true;
        }
      } else if (isGitLab) {
        const metadata = await gitlabClient.fetchRepositoryMetadata(resource.repository);

        if (metadata) {
          // Update the library with fresh data from its repository
          resource.homepage = metadata.homepage || resource.homepage;
          resource.license = metadata.license || resource.license;
          resource.stars = metadata.stars;
          resource.forks = metadata.forks;
          resource.watchers = metadata.watchers;
          resource.openIssues = metadata.openIssues;
          resource.openPullRequests = metadata.openPullRequests;
          resource.lastCommit = metadata.lastCommit;
          resource.lastReleaseVersion = metadata.lastReleaseVersion;
          resource.lastReleaseDate = metadata.lastReleaseDate;
          resource.created = metadata.created;
          resource.languages = metadata.languages;
          resource.archived = metadata.archived;
          resource.hasWiki = metadata.hasWiki;
          resource.hasDiscussions = metadata.hasDiscussions;
          // Merge topics
          resource.topics = [...new Set([...(resource.topics || []), ...metadata.topics])];

          return true;
        }
      } else {
        console.warn(
          `Unsupported repository host for library ${resource.id}: ${resource.repository}`
        );
        this.stats.skipped++;
      }
    } catch (error) {
      console.warn(`Failed to enrich library ${resource.id}:`, error);
      this.stats.failed++;
    }

    return false;
  }

  /**
   * Enrich a paper resource with arXiv metadata
   */
  private async enrichAndUpdatePaper(resource: Paper): Promise<boolean> {
    try {
      // Papers should have an arxivId
      if (!resource.arxivId) {
        console.warn(`Paper ${resource.id} has no arxivId, skipping`);
        this.stats.skipped++;
        return false;
      }

      const metadata = await arxivClient.fetchPaperMetadata(resource.arxivId);

      if (metadata) {
        // Update the paper with fresh data from arXiv
        resource.title = metadata.title;
        resource.authors = metadata.authors;
        resource.abstract = metadata.abstract;
        resource.published = metadata.published;
        resource.doi = metadata.doi || resource.doi;
        resource.venue = metadata.venue || resource.venue;
        resource.pdfUrl = metadata.pdfUrl;
        resource.field = metadata.field || resource.field;
        resource.keywords = resource.keywords || metadata.categories;

        // Update the image if cover was generated
        if (metadata.coverImagePath) {
          resource.image = metadata.coverImagePath;
          resource.imageAlt = `${metadata.title} - Research Paper`;
          console.log(
            `✅ Cover image generated and set for paper ${resource.id}: ${metadata.coverImagePath}`
          );
        }

        return true;
      }
    } catch (error) {
      console.warn(`Failed to enrich paper ${resource.id}:`, error);
      this.stats.failed++;
    }

    return false;
  }

  /**
   * Print fetching statistics
   */
  private printStats(): void {
    console.log("\n=== Fetch Statistics ===");
    console.log(`Total resources: ${this.stats.total}`);
    console.log(`Updated: ${this.stats.updated}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Skipped: ${this.stats.skipped}`);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI script
if (import.meta.url === `file://${process.argv[1]}`) {
  const resourcesDir = path.resolve(process.cwd(), "src/data/resources");
  const force = process.argv.includes("--force");

  const fetcher = new MetadataFetcher();
  fetcher
    .fetchAll(resourcesDir, force)
    .then(() => {
      console.log("\nMetadata fetching completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
