/**
 * PyPI (Python Package Index) API Client for fetching package metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface PyPIPackageInfo {
  name: string;
  version: string;
  summary: string;
  description: string;
  home_page: string;
  project_url: string;
  author: string;
  license: string;
  keywords: string;
  classifiers: string[];
  requires_python?: string;
}

export interface PyPIUrls {
  homepage?: string;
  documentation?: string;
  repository?: string;
  source?: string;

  [key: string]: string | undefined;
}

export interface PyPIPackageData {
  info: PyPIPackageInfo & {
    project_urls?: PyPIUrls;
  };
  releases: {
    [version: string]: Array<{
      upload_time: string;
      [key: string]: unknown;
    }>;
  };
  urls: Array<{
    upload_time: string;
    python_version: string;
  }>;
}

export interface PyPIPackageMetadata {
  name: string;
  description: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  keywords: string[];
  pythonVersion?: string;
  lastUpdated: string;
  created: string;
}

export class PyPIClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: "https://pypi.org/pypi",
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
   * Fetch package metadata from PyPI
   */
  async fetchPackageMetadata(packageName: string): Promise<PyPIPackageMetadata | null> {
    const cacheKey = `pypi_package_${packageName}`;

    // Check cache first
    const cached = cacheManager.get<PyPIPackageMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached PyPI data for ${packageName}`);
      return cached;
    }

    try {
      // Fetch package data
      const pkg = await this.retryWithBackoff(() =>
        this.request<PyPIPackageData>(`/${encodeURIComponent(packageName)}/json`)
      );

      const info = pkg.info;
      const projectUrls = info.project_urls || {};

      // Extract repository URL
      let repositoryUrl =
        projectUrls.repository ||
        projectUrls.Repository ||
        projectUrls.source ||
        projectUrls.Source ||
        projectUrls["Source Code"];

      // If no explicit repository, check if homepage is a GitHub/GitLab URL
      if (
        !repositoryUrl &&
        info.home_page &&
        (info.home_page.includes("github.com") || info.home_page.includes("gitlab.com"))
      ) {
        repositoryUrl = info.home_page;
      }

      // Extract documentation URL
      const documentationUrl =
        projectUrls.documentation ||
        projectUrls.Documentation ||
        projectUrls.docs ||
        projectUrls.Docs;

      // Extract keywords
      const keywords: string[] = [];
      if (info.keywords) {
        keywords.push(...info.keywords.split(/[,\s]+/).filter((k) => k.trim()));
      }

      // Get upload times for first and latest versions
      const versions = Object.keys(pkg.releases).sort();
      let created = "";
      let lastUpdated = "";

      if (versions.length > 0) {
        const firstVersion = pkg.releases[versions[0]];
        if (firstVersion && firstVersion.length > 0) {
          created = this.normalizeISODate(firstVersion[0].upload_time);
        }

        const latestVersion = pkg.releases[info.version];
        if (latestVersion && latestVersion.length > 0) {
          lastUpdated = this.normalizeISODate(latestVersion[0].upload_time);
        }
      }

      // If we couldn't get the dates from releases, use the current package upload time
      if (!lastUpdated && pkg.urls.length > 0) {
        lastUpdated = this.normalizeISODate(pkg.urls[0].upload_time);
      }

      const metadata: PyPIPackageMetadata = {
        name: info.name,
        description: info.summary || info.description,
        version: info.version,
        license: info.license,
        homepage: projectUrls.homepage || projectUrls.Homepage || info.home_page,
        repository: repositoryUrl,
        documentation: documentationUrl,
        keywords,
        pythonVersion: info.requires_python,
        lastUpdated,
        created,
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch PyPI metadata for ${packageName}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple packages
   */
  async fetchMultiplePackages(packageNames: string[]): Promise<Map<string, PyPIPackageMetadata>> {
    const results = new Map<string, PyPIPackageMetadata>();

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
    query: string
  ): Promise<Array<{ name: string; description: string; version: string }>> {
    // Note: PyPI doesn't have a direct search API endpoint
    // We would need to use the PyPI XML-RPC API or warehouse API
    // For now, we'll return an empty array and log a warning
    console.warn("PyPI search is not implemented. Use the web interface instead.");
    return [];
  }

  /**
   * Normalize ISO date to ensure it has timezone information
   */
  private normalizeISODate(dateString: string): string {
    if (!dateString) return "";
    // If date already has timezone, return as-is
    if (dateString.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Add Z for UTC timezone
    return `${dateString}Z`;
  }
}

// Export a singleton instance
export const pypiClient = new PyPIClient();
