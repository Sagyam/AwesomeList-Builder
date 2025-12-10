/**
 * npm Registry API Client for fetching package metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface NpmPackageVersion {
  version: string;
  description: string;
  license: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  keywords?: string[];
}

export interface NpmPackageMetadata {
  name: string;
  description: string;
  "dist-tags": {
    latest: string;
    [tag: string]: string;
  };
  versions: {
    [version: string]: NpmPackageVersion;
  };
  time: {
    created: string;
    modified: string;
    [version: string]: string;
  };
  repository?: {
    type: string;
    url: string;
  };
  homepage?: string;
  keywords?: string[];
  license?: string;
}

export interface NpmDownloads {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export interface PackageMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  downloads: string;
  lastUpdated: string;
  created: string;
}

export class NpmClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: "https://registry.npmjs.org",
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 3600,
      },
      cache: {
        ttl: 3600000, // 1 hour
        enabled: true,
      },
    });
  }

  /**
   * Fetch package metadata from npm
   */
  async fetchPackageMetadata(packageName: string): Promise<PackageMetadata | null> {
    const cacheKey = `npm_package_${packageName}`;

    // Check cache first
    const cached = cacheManager.get<PackageMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached npm data for ${packageName}`);
      return cached;
    }

    try {
      // Fetch package data
      const pkg = await this.retryWithBackoff(() =>
        this.request<NpmPackageMetadata>(`/${encodeURIComponent(packageName)}`)
      );

      // Fetch download stats (last 30 days)
      let downloads = "N/A";
      try {
        const downloadsClient = new BaseApiClient({
          baseUrl: "https://api.npmjs.org",
          rateLimit: {
            requestsPerMinute: 60,
          },
        });

        const downloadsData = await downloadsClient.request<NpmDownloads>(
          `/downloads/point/last-month/${encodeURIComponent(packageName)}`
        );
        downloads = this.formatDownloads(downloadsData.downloads);
      } catch (error) {
        console.warn(`Failed to fetch downloads for ${packageName}:`, error);
      }

      const latestVersion = pkg["dist-tags"].latest;
      const latestVersionData = pkg.versions[latestVersion];

      // Extract repository URL
      let repositoryUrl: string | undefined;
      const repo = pkg.repository || latestVersionData.repository;
      if (repo && repo.url) {
        repositoryUrl = repo.url
          .replace(/^git\+/, "")
          .replace(/\.git$/, "")
          .replace(/^ssh:\/\/git@/, "https://");
      }

      const metadata: PackageMetadata = {
        name: pkg.name,
        description: pkg.description || latestVersionData.description,
        version: latestVersion,
        license: pkg.license || latestVersionData.license,
        homepage: pkg.homepage || latestVersionData.homepage,
        repository: repositoryUrl,
        keywords: pkg.keywords || latestVersionData.keywords || [],
        downloads,
        lastUpdated: pkg.time.modified,
        created: pkg.time.created,
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch npm metadata for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple packages
   */
  async fetchMultiplePackages(packageNames: string[]): Promise<Map<string, PackageMetadata>> {
    const results = new Map<string, PackageMetadata>();

    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < packageNames.length; i += batchSize) {
      const batch = packageNames.slice(i, i + batchSize);

      const promises = batch.map(async (name) => {
        const metadata = await this.fetchPackageMetadata(name);
        if (metadata) {
          results.set(name, metadata);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < packageNames.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Search for packages
   */
  async searchPackages(
    query: string,
    size = 20
  ): Promise<Array<{ name: string; description: string; version: string }>> {
    try {
      const searchClient = new BaseApiClient({
        baseUrl: "https://registry.npmjs.org",
      });

      interface SearchResult {
        objects: Array<{
          package: {
            name: string;
            description: string;
            version: string;
          };
        }>;
      }

      const results = await searchClient.request<SearchResult>(
        `/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`
      );

      return results.objects.map((obj) => obj.package);
    } catch (error) {
      console.error(`Failed to search npm packages for "${query}":`, error);
      return [];
    }
  }

  /**
   * Format download count to human-readable string
   */
  private formatDownloads(count: number): string {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }
}

// Export a singleton instance
export const npmClient = new NpmClient();
