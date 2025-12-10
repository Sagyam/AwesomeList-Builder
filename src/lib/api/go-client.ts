/**
 * Go Packages (pkg.go.dev) API Client for fetching Go module metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface GoModuleInfo {
  Version: string;
  Time: string;
}

export interface GoPackageMetadata {
  name: string;
  description: string;
  version: string;
  repository?: string;
  documentation: string;
  homepage?: string;
  lastUpdated: string;
  license?: string;
}

export class GoClient extends BaseApiClient {
  private proxyClient: BaseApiClient;

  constructor() {
    // pkg.go.dev doesn't have a public JSON API
    // We'll use the Go module proxy for version info
    super({
      baseUrl: "https://pkg.go.dev",
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 1800,
      },
      cache: {
        ttl: 3600000, // 1 hour
        enabled: true,
      },
    });

    // Go module proxy for version information
    this.proxyClient = new BaseApiClient({
      baseUrl: "https://proxy.golang.org",
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 3600,
      },
    });
  }

  /**
   * Fetch Go module metadata
   * @param modulePath Module path (e.g., "github.com/gin-gonic/gin")
   */
  async fetchPackageMetadata(modulePath: string): Promise<GoPackageMetadata | null> {
    const cacheKey = `go_module_${modulePath.replace(/\//g, "_")}`;

    // Check cache first
    const cached = cacheManager.get<GoPackageMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached Go module data for ${modulePath}`);
      return cached;
    }

    try {
      // Fetch latest version info from Go module proxy
      const latestVersion = await this.retryWithBackoff(() =>
        this.proxyClient.request<string>(`/${encodeURIComponent(modulePath)}/@latest`)
      );

      let versionInfo: GoModuleInfo | null = null;
      try {
        versionInfo = JSON.parse(latestVersion) as GoModuleInfo;
      } catch {
        console.warn(`Failed to parse version info for ${modulePath}`);
      }

      // Extract repository URL from module path
      let repositoryUrl: string | undefined;
      let homepage: string | undefined;

      if (modulePath.startsWith("github.com/")) {
        repositoryUrl = `https://${modulePath}`;
        homepage = repositoryUrl;
      } else if (modulePath.startsWith("gitlab.com/")) {
        repositoryUrl = `https://${modulePath}`;
        homepage = repositoryUrl;
      } else if (modulePath.startsWith("bitbucket.org/")) {
        repositoryUrl = `https://${modulePath}`;
        homepage = repositoryUrl;
      } else {
        homepage = `https://pkg.go.dev/${modulePath}`;
      }

      // Clean up version string
      let version = versionInfo?.Version || "0.0.0";
      // Strip 'v' prefix and handle pseudo-versions
      version = version.replace(/^v/, "").split("+")[0].split("-")[0];
      // If still not valid semver, default to 0.0.0
      if (!/^\d+\.\d+\.\d+/.test(version)) {
        version = "0.0.0";
      }

      const metadata: GoPackageMetadata = {
        name: modulePath,
        description: `Go module: ${modulePath}`,
        version,
        repository: repositoryUrl,
        documentation: `https://pkg.go.dev/${modulePath}`,
        homepage,
        lastUpdated: versionInfo?.Time || new Date().toISOString(),
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch Go module metadata for ${modulePath}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple Go modules
   */
  async fetchMultiplePackages(modulePaths: string[]): Promise<Map<string, GoPackageMetadata>> {
    const results = new Map<string, GoPackageMetadata>();

    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < modulePaths.length; i += batchSize) {
      const batch = modulePaths.slice(i, i + batchSize);

      const promises = batch.map(async (path) => {
        const metadata = await this.fetchPackageMetadata(path);
        if (metadata) {
          results.set(path, metadata);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < modulePaths.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Search is not directly supported via API
   * Users should use https://pkg.go.dev/search manually
   */
  async searchPackages(query: string): Promise<Array<{ name: string }>> {
    console.warn(
      `Go package search is not supported via API. Visit https://pkg.go.dev/search?q=${encodeURIComponent(query)}`
    );
    return [];
  }
}

// Export a singleton instance
export const goClient = new GoClient();
