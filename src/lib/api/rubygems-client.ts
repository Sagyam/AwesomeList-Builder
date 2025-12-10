/**
 * RubyGems API Client for fetching Ruby gem metadata
 */

import {BaseApiClient} from "./base-client.ts";
import {cacheManager} from "./cache-manager.ts";

export interface RubyGemVersion {
    number: string;
    created_at: string;
    downloads_count: number;
}

export interface RubyGemMetadata {
    name: string;
    downloads: number;
    version: string;
    version_created_at: string;
    version_downloads: number;
    authors: string;
    info: string;
    licenses: string[];
    metadata: {
        homepage_uri?: string;
        source_code_uri?: string;
        documentation_uri?: string;
        bug_tracker_uri?: string;
        changelog_uri?: string;
    };
    sha: string;
    project_uri: string;
    gem_uri: string;
    homepage_uri?: string;
    wiki_uri?: string;
    documentation_uri?: string;
    mailing_list_uri?: string;
    source_code_uri?: string;
    bug_tracker_uri?: string;
    changelog_uri?: string;
    funding_uri?: string;
}

export interface RubyGemsPackageMetadata {
    name: string;
    description: string;
    version: string;
    license?: string;
    homepage?: string;
    repository?: string;
    documentation?: string;
    downloads: string;
    lastUpdated: string;
    authors: string[];
}

export class RubyGemsClient extends BaseApiClient {
    constructor() {
        super({
            baseUrl: "https://rubygems.org/api/v1",
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
     * Fetch gem metadata from RubyGems
     */
    async fetchPackageMetadata(
        gemName: string,
    ): Promise<RubyGemsPackageMetadata | null> {
        const cacheKey = `rubygems_gem_${gemName}`;

        // Check cache first
        const cached = cacheManager.get<RubyGemsPackageMetadata>(cacheKey);
        if (cached) {
            console.log(`Using cached RubyGems data for ${gemName}`);
            return cached;
        }

        try {
            // Fetch gem data
            const gem = await this.retryWithBackoff(() =>
                this.request<RubyGemMetadata>(`/gems/${encodeURIComponent(gemName)}.json`),
            );

            // Extract repository URL
            let repositoryUrl =
                gem.source_code_uri ||
                gem.metadata?.source_code_uri;

            // If no explicit repository, check if homepage is a GitHub/GitLab URL
            if (
                !repositoryUrl &&
                gem.homepage_uri &&
                (gem.homepage_uri.includes("github.com") ||
                    gem.homepage_uri.includes("gitlab.com"))
            ) {
                repositoryUrl = gem.homepage_uri;
            }

            // Parse authors
            const authors = gem.authors
                ? gem.authors.split(",").map((a) => a.trim())
                : [];

            // Get license
            const license = gem.licenses && gem.licenses.length > 0
                ? gem.licenses.join(", ")
                : undefined;

            const metadata: RubyGemsPackageMetadata = {
                name: gem.name,
                description: gem.info,
                version: gem.version,
                license,
                homepage: gem.homepage_uri || gem.metadata?.homepage_uri,
                repository: repositoryUrl,
                documentation:
                    gem.documentation_uri || gem.metadata?.documentation_uri,
                downloads: this.formatDownloads(gem.downloads),
                lastUpdated: gem.version_created_at,
                authors,
            };

            // Cache the result
            cacheManager.set(cacheKey, metadata);

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch RubyGems metadata for ${gemName}:`, error);
            return null;
        }
    }

    /**
     * Batch fetch multiple gems
     */
    async fetchMultiplePackages(
        gemNames: string[],
    ): Promise<Map<string, RubyGemsPackageMetadata>> {
        const results = new Map<string, RubyGemsPackageMetadata>();

        // Process in batches
        const batchSize = 5;
        for (let i = 0; i < gemNames.length; i += batchSize) {
            const batch = gemNames.slice(i, i + batchSize);

            const promises = batch.map(async (name) => {
                const metadata = await this.fetchPackageMetadata(name);
                if (metadata) {
                    results.set(name, metadata);
                }
            });

            await Promise.all(promises);

            // Small delay between batches
            if (i + batchSize < gemNames.length) {
                await this.sleep(1000);
            }
        }

        return results;
    }

    /**
     * Search for gems
     */
    async searchGems(
        query: string,
    ): Promise<Array<{ name: string; downloads: number; version: string }>> {
        try {
            interface SearchResult {
                name: string;
                downloads: number;
                version: string;
                version_downloads: number;
                platform: string;
                authors: string;
                info: string;
                licenses: string;
                metadata: Record<string, unknown>;
                sha: string;
                project_uri: string;
                gem_uri: string;
            }

            const results = await this.request<SearchResult[]>(
                `/search.json?query=${encodeURIComponent(query)}`,
            );

            return results.map((gem) => ({
                name: gem.name,
                downloads: gem.downloads,
                version: gem.version,
            }));
        } catch (error) {
            console.error(`Failed to search RubyGems for "${query}":`, error);
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
export const rubygemsClient = new RubyGemsClient();
