/**
 * Maven Central API Client for fetching Java package metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface MavenSearchDoc {
  id: string;
  g: string; // groupId
  a: string; // artifactId
  latestVersion: string;
  repositoryId: string;
  p: string; // packaging
  timestamp: number;
  versionCount: number;
  text: string[];
  ec: string[];
}

export interface MavenSearchResponse {
  response: {
    numFound: number;
    start: number;
    docs: MavenSearchDoc[];
  };
}

export interface MavenVersionDoc {
  id: string;
  g: string;
  a: string;
  v: string; // version
  p: string; // packaging
  timestamp: number;
  ec: string[];
  tags: string[];
}

export interface MavenArtifactMetadata {
  name: string;
  groupId: string;
  artifactId: string;
  description: string;
  version: string;
  packaging: string;
  lastUpdated: string;
  repository?: string;
  homepage?: string;
}

export class MavenClient extends BaseApiClient {
  constructor() {
    super({
      baseUrl: "https://mvnrepository.com",
      rateLimit: {
        requestsPerMinute: 30,
        requestsPerHour: 1800,
      },
      cache: {
        ttl: 3600000, // 1 hour
        enabled: true,
      },
      timeout: 15000,
    });
  }

  /**
   * Fetch artifact metadata from MVN Repository
   * @param coords Artifact coordinates in format "groupId:artifactId"
   */
  async fetchPackageMetadata(coords: string): Promise<MavenArtifactMetadata | null> {
    const [groupId, artifactId] = coords.split(":");
    if (!groupId || !artifactId) {
      console.warn(`Invalid Maven coordinates: ${coords}. Use format "groupId:artifactId"`);
      return null;
    }

    const cacheKey = `maven_artifact_${groupId}_${artifactId}`;

    // Check cache first
    const cached = cacheManager.get<MavenArtifactMetadata>(cacheKey);
    if (cached) {
      console.log(`Using cached Maven data for ${coords}`);
      return cached;
    }

    try {
      // MVN Repository URL format: /artifact/groupId/artifactId
      const url = `/artifact/${groupId}/${artifactId}`;

      // Fetch the HTML page
      const html = await this.retryWithBackoff(() => this.request<string>(url));

      // Basic HTML parsing to extract metadata
      // MVN Repository has a predictable structure we can parse
      const versionMatch = html.match(/<a[^>]+class="vbtn release"[^>]*>([^<]+)</);
      const version = versionMatch ? versionMatch[1].trim() : "1.0.0";

      // Extract description from meta tag or page content
      const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
      const description = descMatch ? descMatch[1] : `${groupId}:${artifactId}`;

      // Extract last updated date
      const dateMatch = html.match(/<td>Date<\/td>\s*<td[^>]*>([^<]+)</);
      let lastUpdated = new Date().toISOString();
      if (dateMatch) {
        try {
          lastUpdated = new Date(dateMatch[1].trim()).toISOString();
        } catch {
          // Keep default if parsing fails
        }
      }

      // Try to extract repository URL from common patterns
      let repositoryUrl: string | undefined;
      let homepage: string | undefined;

      // Check for repository links in the page
      const repoMatch = html.match(/<a[^>]+href="(https:\/\/github\.com\/[^"]+)"/);
      if (repoMatch) {
        repositoryUrl = repoMatch[1];
        homepage = repositoryUrl;
      } else {
        // Fallback to pattern matching
        if (groupId.startsWith("com.github.")) {
          const username = groupId.replace("com.github.", "");
          repositoryUrl = `https://github.com/${username}/${artifactId}`;
          homepage = repositoryUrl;
        } else if (groupId.startsWith("org.springframework")) {
          repositoryUrl = `https://github.com/spring-projects/spring-boot`;
          homepage = "https://spring.io";
        } else if (groupId.startsWith("org.apache.")) {
          const project = groupId.split(".")[2];
          repositoryUrl = `https://github.com/apache/${project}`;
          homepage = `https://${project}.apache.org`;
        } else if (groupId.startsWith("com.fasterxml.jackson")) {
          repositoryUrl = `https://github.com/FasterXML/jackson`;
          homepage = "https://github.com/FasterXML/jackson";
        }
      }

      const metadata: MavenArtifactMetadata = {
        name: `${groupId}:${artifactId}`,
        groupId,
        artifactId,
        description,
        version,
        packaging: "jar",
        lastUpdated,
        repository: repositoryUrl,
        homepage,
      };

      // Cache the result
      cacheManager.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch Maven metadata for ${coords}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple artifacts
   */
  async fetchMultiplePackages(coordinates: string[]): Promise<Map<string, MavenArtifactMetadata>> {
    const results = new Map<string, MavenArtifactMetadata>();

    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize);

      const promises = batch.map(async (coords) => {
        const metadata = await this.fetchPackageMetadata(coords);
        if (metadata) {
          results.set(coords, metadata);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < coordinates.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Search for artifacts via MVN Repository
   * Note: This requires HTML scraping and is not as reliable as a JSON API
   */
  async searchArtifacts(
    query: string,
    rows = 20
  ): Promise<Array<{ groupId: string; artifactId: string; version: string }>> {
    try {
      console.warn(
        `Maven search via MVN Repository requires scraping. Visit https://mvnrepository.com/search?q=${encodeURIComponent(query)}`
      );
      return [];
    } catch (error) {
      console.error(`Failed to search Maven artifacts for "${query}":`, error);
      return [];
    }
  }
}

// Export a singleton instance
export const mavenClient = new MavenClient();
