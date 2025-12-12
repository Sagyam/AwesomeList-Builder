/**
 * Metadata Scraper Client - Fetches metadata from web pages using SEO tags
 * Used for Certification, Cheatsheet, Community, Conference, Documentation, and Tool resources
 */

import type {
    CertificationMetadata,
    CheatsheetMetadata,
    CommunityMetadata,
    ConferenceMetadata,
    DocumentationMetadata,
    ToolMetadata,
} from "@/schema/ts";
import {BaseApiClient} from "./base-client.ts";

interface ScrapedMetadata {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    keywords?: string[];

    [key: string]: unknown;
}

export class MetadataClient extends BaseApiClient {
    constructor() {
        super({
            baseUrl: "", // No base URL needed for scraping
            rateLimit: {
                requestsPerMinute: 30,
                requestsPerHour: 1000,
            },
            cache: {
                ttl: 86400000, // 24 hours
                enabled: true,
            },
        });
    }

    /**
     * Fetch and parse metadata from a URL
     */
    async fetchPageMetadata(url: string): Promise<ScrapedMetadata> {
        try {
            await this.checkRateLimit();

            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (compatible; AwesomeList-Builder/1.0; +https://github.com/yourrepo)",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            return this.parseMetaTags(html, url);
        } catch (error) {
            console.error(`Failed to fetch metadata from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Fetch certification metadata
     */
    async fetchCertificationMetadata(
        certificationUrl: string
    ): Promise<CertificationMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(certificationUrl);

            const metadata: CertificationMetadata = {
                title: scraped.title || "Unknown Certification",
                description: scraped.description || "",
                provider: scraped.siteName || this.extractDomain(certificationUrl),
                providerUrl: this.extractBaseUrl(certificationUrl),
                image: scraped.image,
                language: scraped.locale,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch certification metadata:`, error);
            return null;
        }
    }

    /**
     * Fetch cheatsheet metadata
     */
    async fetchCheatsheetMetadata(cheatsheetUrl: string): Promise<CheatsheetMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(cheatsheetUrl);

            const metadata: CheatsheetMetadata = {
                title: scraped.title || "Unknown Cheatsheet",
                description: scraped.description || "",
                subject: this.extractSubject(scraped),
                author: scraped.author,
                published: scraped.publishedTime,
                updated: scraped.modifiedTime,
                topics: scraped.keywords,
                image: scraped.image,
                language: scraped.locale,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch cheatsheet metadata:`, error);
            return null;
        }
    }

    /**
     * Fetch community metadata
     */
    async fetchCommunityMetadata(communityUrl: string): Promise<CommunityMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(communityUrl);

            const platform = this.detectPlatform(communityUrl);

            const metadata: CommunityMetadata = {
                name: scraped.title || "Unknown Community",
                description: scraped.description || "",
                platform,
                topics: scraped.keywords,
                image: scraped.image,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch community metadata:`, error);
            return null;
        }
    }

    /**
     * Fetch conference metadata
     */
    async fetchConferenceMetadata(conferenceUrl: string): Promise<ConferenceMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(conferenceUrl);

            const metadata: ConferenceMetadata = {
                name: scraped.title || "Unknown Conference",
                description: scraped.description || "",
                topics: scraped.keywords,
                image: scraped.image,
                language: scraped.locale,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch conference metadata:`, error);
            return null;
        }
    }

    /**
     * Fetch documentation metadata
     */
    async fetchDocumentationMetadata(
        documentationUrl: string
    ): Promise<DocumentationMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(documentationUrl);

            const metadata: DocumentationMetadata = {
                title: scraped.title || "Unknown Documentation",
                description: scraped.description || "",
                project: scraped.siteName,
                projectUrl: this.extractBaseUrl(documentationUrl),
                topics: scraped.keywords,
                image: scraped.image,
                language: scraped.locale,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch documentation metadata:`, error);
            return null;
        }
    }

    /**
     * Fetch tool metadata
     */
    async fetchToolMetadata(toolUrl: string): Promise<ToolMetadata | null> {
        try {
            const scraped = await this.fetchPageMetadata(toolUrl);

            const metadata: ToolMetadata = {
                name: scraped.title || "Unknown Tool",
                description: scraped.description || "",
                homepage: toolUrl,
                developer: scraped.author || scraped.siteName,
                topics: scraped.keywords,
                image: scraped.image,
                language: scraped.locale,
                fetchedAt: new Date().toISOString(),
            };

            return metadata;
        } catch (error) {
            console.error(`Failed to fetch tool metadata:`, error);
            return null;
        }
    }

    /**
     * Parse meta tags from HTML
     */
    private parseMetaTags(html: string, url: string): ScrapedMetadata {
        const metadata: ScrapedMetadata = {};

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
            metadata.title = this.cleanText(titleMatch[1]);
        }

        // Extract meta tags
        const metaTagRegex = /<meta\s+([^>]+)>/gi;
        let match;

        while ((match = metaTagRegex.exec(html)) !== null) {
            const attributes = match[1];
            const nameMatch = attributes.match(/(?:name|property)=["']([^"']+)["']/i);
            const contentMatch = attributes.match(/content=["']([^"']+)["']/i);

            if (nameMatch && contentMatch) {
                const name = nameMatch[1].toLowerCase();
                const content = this.cleanText(contentMatch[1]);

                // OpenGraph tags
                if (name === "og:title") metadata.title = metadata.title || content;
                if (name === "og:description") metadata.description = content;
                if (name === "og:image") metadata.image = content;
                if (name === "og:url") metadata.url = content;
                if (name === "og:type") metadata.type = content;
                if (name === "og:site_name") metadata.siteName = content;
                if (name === "og:locale") metadata.locale = content;

                // Twitter Card tags
                if (name === "twitter:title") metadata.title = metadata.title || content;
                if (name === "twitter:description")
                    metadata.description = metadata.description || content;
                if (name === "twitter:image") metadata.image = metadata.image || content;

                // Standard meta tags
                if (name === "description")
                    metadata.description = metadata.description || content;
                if (name === "keywords")
                    metadata.keywords = content.split(",").map((k) => k.trim());
                if (name === "author") metadata.author = content;

                // Article tags
                if (name === "article:published_time") metadata.publishedTime = content;
                if (name === "article:modified_time") metadata.modifiedTime = content;

                // Store other tags with their original names
                metadata[name] = content;
            }
        }

        // Fallback: extract first h1 if no title found
        if (!metadata.title) {
            const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
            if (h1Match) {
                metadata.title = this.cleanText(h1Match[1]);
            }
        }

        // Fallback: extract first p tag if no description found
        if (!metadata.description) {
            const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
            if (pMatch) {
                metadata.description = this.cleanText(pMatch[1]).slice(0, 300);
            }
        }

        metadata.url = metadata.url || url;

        return metadata;
    }

    /**
     * Clean and decode HTML entities in text
     */
    private cleanText(text: string): string {
        return text
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    /**
     * Extract domain name from URL
     */
    private extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, "");
        } catch {
            return "Unknown";
        }
    }

    /**
     * Extract base URL (protocol + domain)
     */
    private extractBaseUrl(url: string): string | undefined {
        try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.hostname}`;
        } catch {
            return undefined;
        }
    }

    /**
     * Extract subject from scraped metadata
     */
    private extractSubject(scraped: ScrapedMetadata): string {
        // Try to extract from keywords or title
        if (scraped.keywords && scraped.keywords.length > 0) {
            return scraped.keywords[0];
        }
        if (scraped.title) {
            // Extract first word or phrase
            const match = scraped.title.match(/^([A-Za-z0-9+#]+)/);
            return match ? match[1] : "General";
        }
        return "General";
    }

    /**
     * Detect platform from URL
     */
    private detectPlatform(url: string): string {
        const lowerUrl = url.toLowerCase();

        if (lowerUrl.includes("discord.com") || lowerUrl.includes("discord.gg"))
            return "Discord";
        if (lowerUrl.includes("slack.com")) return "Slack";
        if (lowerUrl.includes("reddit.com")) return "Reddit";
        if (lowerUrl.includes("discourse.")) return "Discourse";
        if (lowerUrl.includes("github.com/discussions")) return "GitHub Discussions";
        if (lowerUrl.includes("community.")) return "Forum";
        if (lowerUrl.includes("forum.")) return "Forum";

        return "Community";
    }
}

// Export singleton instance
export const metadataClient = new MetadataClient();
