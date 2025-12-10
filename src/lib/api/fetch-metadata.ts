/**
 * Build-time data fetching script
 * Fetches metadata for all resources and enriches them with external data
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import type {Library} from "@/schema/ts/library.interface.ts";
import type {Repository} from "@/schema/ts/repository.interface.ts";
import type {Resource} from "@/schema/ts/types.ts";
import {cacheManager} from "./cache-manager.ts";
import {cargoClient} from "./cargo-client.ts";
import {githubClient} from "./github-client.ts";
import {gitlabClient} from "./gitlab-client.ts";
import {goClient} from "./go-client.ts";
import {mavenClient} from "./maven-client.ts";
import {npmClient} from "./npm-client.ts";
import {packagistClient} from "./packagist-client.ts";
import {pypiClient} from "./pypi-client.ts";
import {rubygemsClient} from "./rubygems-client.ts";

export interface FetchStats {
  total: number;
  fetched: number;
  cached: number;
  failed: number;
  skipped: number;
}

export class MetadataFetcher {
  private stats: FetchStats = {
    total: 0,
    fetched: 0,
    cached: 0,
    failed: 0,
    skipped: 0,
  };

  /**
   * Fetch and enrich all resources
   */
  async fetchAll(resourcesDir: string, outputDir?: string): Promise<Resource[]> {
    console.log("Loading resources...");
    const resources = this.loadResources(resourcesDir);
    this.stats.total = resources.length;

    console.log(`Found ${resources.length} resources`);
    console.log("Fetching metadata...");

    const enrichedResources: Resource[] = [];

    // Process in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize);

      const enrichedBatch = await Promise.all(
        batch.map((resource) => this.enrichResource(resource))
      );

      enrichedResources.push(...enrichedBatch);

      // Progress indicator
      console.log(
        `Progress: ${i + batch.length}/${resources.length} (${Math.round(((i + batch.length) / resources.length) * 100)}%)`
      );

      // Small delay between batches
      if (i + batchSize < resources.length) {
        await this.sleep(1000);
      }
    }

    // Always save enriched resources to cache for build process
    this.saveEnrichedDataCache(enrichedResources);

    // Optionally save enriched resources to YAML files
    if (outputDir) {
      this.saveEnrichedResources(enrichedResources, outputDir);
    }

    this.printStats();

    return enrichedResources;
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
      if (file === "metadata.yaml") continue;

      try {
        const filePath = path.join(resourcesDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const resource = yaml.parse(content) as Resource;
        resources.push(resource);
      } catch (error) {
        console.warn(`Failed to load resource from ${file}:`, error);
      }
    }

    return resources;
  }

  /**
   * Enrich a repository resource with GitHub or GitLab data
   */
  private async enrichRepository(resource: Repository): Promise<Repository> {
    try {
      // Determine if it's GitHub or GitLab
      const isGitHub = resource.repositoryUrl.includes("github.com");
      const isGitLab = resource.repositoryUrl.includes("gitlab.com");

      if (isGitHub) {
        const metadata = await githubClient.fetchRepositoryMetadata(resource.repositoryUrl);

        if (metadata) {
          this.stats.fetched++;
          return {
            ...resource,
            owner: metadata.owner,
            ownerUrl: metadata.ownerUrl,
            homepage: metadata.homepage || resource.homepage,
            license: metadata.license || resource.license,
            stars: metadata.stars,
            forks: metadata.forks,
            watchers: metadata.watchers,
            openIssues: metadata.openIssues,
            lastCommit: metadata.lastCommit,
            created: metadata.created,
            primaryLanguage: metadata.primaryLanguage || resource.primaryLanguage,
            languages: metadata.languages,
            archived: metadata.archived,
            hasWiki: metadata.hasWiki,
            hasDiscussions: metadata.hasDiscussions,
            // Merge topics from GitHub with existing tags
            topics: [...new Set([...(resource.topics || []), ...metadata.topics])],
          };
        }
      } else if (isGitLab) {
        const metadata = await gitlabClient.fetchRepositoryMetadata(resource.repositoryUrl);

        if (metadata) {
          this.stats.fetched++;
          return {
            ...resource,
            owner: metadata.owner,
            ownerUrl: metadata.ownerUrl,
            homepage: metadata.homepage || resource.homepage,
            license: metadata.license || resource.license,
            stars: metadata.stars,
            forks: metadata.forks,
            openIssues: metadata.openIssues,
            lastCommit: metadata.lastActivity,
            created: metadata.created,
            primaryLanguage: metadata.primaryLanguage || resource.primaryLanguage,
            languages: metadata.languages,
            archived: metadata.archived,
            // Merge topics from GitLab with existing tags
            topics: [...new Set([...(resource.topics || []), ...metadata.topics])],
          };
        }
      } else {
        console.warn(`Unsupported repository host: ${resource.repositoryUrl}`);
        this.stats.skipped++;
      }
    } catch (error) {
      console.warn(`Failed to enrich repository ${resource.repositoryUrl}:`, error);
      this.stats.failed++;
    }

    return resource;
  }

  /**
   * Enrich a library resource with package registry data
   */
  private async enrichLibrary(resource: Library): Promise<Library> {
    try {
      const registry = resource.package.registry;
      const packageName = resource.package.name;

      let metadata:
        | Awaited<ReturnType<typeof npmClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof pypiClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof cargoClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof rubygemsClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof mavenClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof goClient.fetchPackageMetadata>>
        | Awaited<ReturnType<typeof packagistClient.fetchPackageMetadata>>
        | null = null;

      switch (registry) {
        case "npm":
          metadata = await npmClient.fetchPackageMetadata(packageName);
          break;
        case "pypi":
          metadata = await pypiClient.fetchPackageMetadata(packageName);
          break;
        case "cargo":
          metadata = await cargoClient.fetchPackageMetadata(packageName);
          break;
        case "rubygems":
          metadata = await rubygemsClient.fetchPackageMetadata(packageName);
          break;
        case "maven":
          metadata = await mavenClient.fetchPackageMetadata(packageName);
          break;
        case "go":
          metadata = await goClient.fetchPackageMetadata(packageName);
          break;
        case "packagist":
          metadata = await packagistClient.fetchPackageMetadata(packageName);
          break;
        default:
          console.warn(`Unsupported registry: ${registry}`);
          this.stats.skipped++;
          return resource;
      }

      if (metadata) {
        this.stats.fetched++;

        const enriched: Library = {
          ...resource,
          repository: metadata.repository || resource.repository,
          homepage: metadata.homepage || resource.homepage,
          license: metadata.license || resource.license,
          version: metadata.version,
          lastUpdated: metadata.lastUpdated,
        };

        // Add downloads if available (npm, cargo, rubygems, packagist)
        if ("downloads" in metadata) {
          enriched.downloads = metadata.downloads;
        }

        // Add documentation if available
        if ("documentation" in metadata && metadata.documentation) {
          enriched.documentation = metadata.documentation;
        }

        return enriched;
      }
    } catch (error) {
      console.warn(`Failed to enrich library ${resource.package.name}:`, error);
      this.stats.failed++;
    }

    return resource;
  }

  /**
   * Enrich a single resource based on its type
   */
  private async enrichResource(resource: Resource): Promise<Resource> {
    switch (resource.type) {
      case "repository":
        return await this.enrichRepository(resource as Repository);
      case "library":
        return await this.enrichLibrary(resource as Library);
      default:
        // Other resource types don't need enrichment yet
        this.stats.skipped++;
        return resource;
    }
  }

  /**
   * Save enriched resources to JSON cache for build process
   */
  private saveEnrichedDataCache(resources: Resource[]): void {
    const cacheDir = path.join(process.cwd(), "cache");
    const cachePath = path.join(cacheDir, "enriched-resources.json");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    try {
      fs.writeFileSync(cachePath, JSON.stringify(resources, null, 2), "utf-8");
      console.log(`Saved enriched data cache to ${cachePath}`);
    } catch (error) {
      console.error("Failed to save enriched data cache:", error);
    }
  }

  /**
   * Save enriched resources back to YAML files
   */
  private saveEnrichedResources(resources: Resource[], outputDir: string): void {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const resource of resources) {
      try {
        const fileName = `${resource.id}.yaml`;
        const filePath = path.join(outputDir, fileName);
        const content = yaml.stringify(resource);
        fs.writeFileSync(filePath, content, "utf-8");
      } catch (error) {
        console.warn(`Failed to save resource ${resource.id}:`, error);
      }
    }

    console.log(`Saved ${resources.length} enriched resources to ${outputDir}`);
  }

  /**
   * Print fetching statistics
   */
  private printStats(): void {
    console.log("\n=== Fetch Statistics ===");
    console.log(`Total resources: ${this.stats.total}`);
    console.log(`Fetched: ${this.stats.fetched}`);
    console.log(`Cached: ${this.stats.cached}`);
    console.log(`Failed: ${this.stats.failed}`);
    console.log(`Skipped: ${this.stats.skipped}`);

    const cacheStats = cacheManager.getStats();
    console.log(`\nCache: ${cacheStats.total} entries, ${(cacheStats.size / 1024).toFixed(2)} KB`);
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

  const fetcher = new MetadataFetcher();
  fetcher
    .fetchAll(resourcesDir)
    .then(() => {
      console.log("\nMetadata fetching completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
