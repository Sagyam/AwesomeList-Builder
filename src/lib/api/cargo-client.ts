/**
 * Cargo (crates.io) API Client for fetching Rust package metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface CrateVersion {
  num: string;
  created_at: string;
  updated_at: string;
  downloads: number;
  license: string;
}

export interface CrateMetadata {
  crate: {
    id: string;
    name: string;
    description: string;
    homepage: string | null;
    documentation: string | null;
    repository: string | null;
    downloads: number;
    recent_downloads: number;
    max_version: string;
    max_stable_version: string;
    created_at: string;
    updated_at: string;
    keywords: string[];
    categories: string[];
  };
  versions: CrateVersion[];
}

export interface CargoPackageMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  keywords: string[];
  categories: string[];
  downloads: string;
  recentDownloads: string;
  lastUpdated: string;
  created: string;
}

export class CargoClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: "https://crates.io/api/v1",
      headers: {
        "User-Agent": "AwesomeKit/1.0 (https://github.com/your-repo)", // Required by crates.io
      },
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
   * Fetch package metadata from crates.io
   */
  async fetchPackageMetadata(packageName: string): Promise<CargoPackageMetadata | null> {
    const cacheKey = `cargo_package_${packageName}`;

    // Check cache first
    const cached = cacheManager.get<CargoPackageMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached Cargo data for ${packageName}`);
      return cached;
    }

    try {
      // Fetch crate data
      const data = await this.retryWithBackoff(() =>
        this.request<CrateMetadata>(`/crates/${encodeURIComponent(packageName)}`)
      );

      const crate = data.crate;
      const latestVersion = data.versions.find(
        (v) => v.num === crate.max_stable_version || v.num === crate.max_version
      );

      const metadata: CargoPackageMetadata = {
        name: crate.name,
        description: crate.description,
        version: crate.max_stable_version || crate.max_version,
        license: latestVersion?.license,
        homepage: crate.homepage || undefined,
        repository: crate.repository || undefined,
        documentation: crate.documentation || undefined,
        keywords: crate.keywords,
        categories: crate.categories,
        downloads: this.formatDownloads(crate.downloads),
        recentDownloads: this.formatDownloads(crate.recent_downloads),
        lastUpdated: crate.updated_at,
        created: crate.created_at,
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch Cargo metadata for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple packages
   */
  async fetchMultiplePackages(packageNames: string[]): Promise<Map<string, CargoPackageMetadata>> {
    const results = new Map<string, CargoPackageMetadata>();

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

      // Small delay between batches to respect rate limits
      if (i + batchSize < packageNames.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Search for crates
   */
  async searchCrates(
    query: string,
    perPage = 20
  ): Promise<Array<{ name: string; description: string; version: string; downloads: number }>> {
    try {
      interface SearchResult {
        crates: Array<{
          name: string;
          description: string;
          max_version: string;
          downloads: number;
        }>;
      }

      const results = await this.request<SearchResult>(
        `/crates?q=${encodeURIComponent(query)}&per_page=${perPage}`
      );

      return results.crates.map((crate) => ({
        name: crate.name,
        description: crate.description,
        version: crate.max_version,
        downloads: crate.downloads,
      }));
    } catch (error) {
      console.error(`Failed to search Cargo crates for "${query}":`, error);
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
export const cargoClient = new CargoClient();
