/**
 * Packagist API Client for fetching PHP package metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface PackagistPackageVersion {
  name: string;
  description: string;
  keywords: string[];
  homepage?: string;
  version: string;
  license: string[];
  authors: Array<{
    name: string;
    email?: string;
    homepage?: string;
  }>;
  source?: {
    url: string;
    type: string;
    reference: string;
  };
  time: string;
}

export interface PackagistV2Response {
  packages: {
    [packageName: string]: PackagistPackageVersion[];
  };
}

export interface PackagistPackageMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  downloads: string;
  monthlyDownloads: string;
  stars?: number;
  lastUpdated: string;
  authors: string[];
}

export class PackagistClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: "https://repo.packagist.org",
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
   * Fetch package metadata from Packagist
   * @param packageName Package name in vendor/package format (e.g., "symfony/http-foundation")
   */
  async fetchPackageMetadata(packageName: string): Promise<PackagistPackageMetadata | null> {
    const cacheKey = `packagist_package_${packageName.replace(/\//g, "_")}`;

    // Check cache first
    const cached = cacheManager.get<PackagistPackageMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached Packagist data for ${packageName}`);
      return cached;
    }

    try {
      // Fetch package data from Packagist v2 API
      const data = await this.retryWithBackoff(() =>
        this.request<PackagistV2Response>(`/p2/${encodeURIComponent(packageName)}.json`)
      );

      const versions = data.packages[packageName];

      if (!versions || !Array.isArray(versions) || versions.length === 0) {
        console.warn(`Invalid Packagist response for ${packageName}`);
        return null;
      }

      // Get latest stable version (filter out dev/alpha/beta)
      const stableVersions = versions.filter(
        (v) =>
          !v.version.includes("dev") &&
          !v.version.includes("alpha") &&
          !v.version.includes("beta") &&
          !v.version.includes("RC")
      );

      const versionData = stableVersions[0] || versions[0];

      // Extract repository URL
      let repositoryUrl: string | undefined;
      if (versionData.source) {
        repositoryUrl = versionData.source.url
          .replace(/^git@github\.com:/, "https://github.com/")
          .replace(/\.git$/, "");
      }

      // Parse authors
      const authors = versionData.authors ? versionData.authors.map((a) => a.name) : [];

      // Get license
      const license =
        versionData.license && versionData.license.length > 0
          ? versionData.license.join(", ")
          : undefined;

      // For download stats and stars, we need to call the main Packagist API
      let downloads = "N/A";
      let monthlyDownloads = "N/A";
      let stars: number | undefined;

      try {
        const statsClient = new BaseApiClient({
          baseUrl: "https://packagist.org",
        });

        interface PackagistStats {
          package: {
            downloads: {
              total: number;
              monthly: number;
              daily: number;
            };
            favers: number;
            github_stars?: number;
          };
        }

        const stats = await statsClient.request<PackagistStats>(
          `/packages/${encodeURIComponent(packageName)}.json`
        );

        if (stats.package) {
          downloads = this.formatDownloads(stats.package.downloads.total);
          monthlyDownloads = this.formatDownloads(stats.package.downloads.monthly);
          stars = stats.package.github_stars || stats.package.favers;
        }
      } catch (error) {
        console.warn(`Failed to fetch download stats for ${packageName}:`, error);
      }

      // Normalize date to use Z instead of +00:00
      const lastUpdated = versionData.time.replace(/\+00:00$/, "Z");

      const metadata: PackagistPackageMetadata = {
        name: versionData.name,
        description: versionData.description,
        version: versionData.version.replace(/^v/, ""), // Strip 'v' prefix
        license,
        homepage: versionData.homepage,
        repository: repositoryUrl,
        keywords: versionData.keywords || [],
        downloads,
        monthlyDownloads,
        stars,
        lastUpdated,
        authors,
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch Packagist metadata for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple packages
   */
  async fetchMultiplePackages(
    packageNames: string[]
  ): Promise<Map<string, PackagistPackageMetadata>> {
    const results = new Map<string, PackagistPackageMetadata>();

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
    perPage = 15
  ): Promise<Array<{ name: string; description: string; downloads: number; favers: number }>> {
    try {
      const searchClient = new BaseApiClient({
        baseUrl: "https://packagist.org",
      });

      interface SearchResult {
        results: Array<{
          name: string;
          description: string;
          downloads: number;
          favers: number;
          repository: string;
        }>;
        total: number;
      }

      const results = await searchClient.request<SearchResult>(
        `/search.json?q=${encodeURIComponent(query)}&per_page=${perPage}`
      );

      return results.results;
    } catch (error) {
      console.error(`Failed to search Packagist for "${query}":`, error);
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
export const packagistClient = new PackagistClient();
