/**
 * Podcast API Client using RSS feeds
 */

import Parser from "rss-parser";
import { BaseApiClient, ApiError } from "./base-client.ts";

export interface PodcastMetadata {
    title: string;
    description: string;
    image?: string;
    author?: string;
    link?: string;
    lastBuildDate?: string;
    episodes: Array<{
        title: string;
        published: string;
        duration?: string;
        url?: string;
        image?: string;
    }>;
}

export class PodcastClient extends BaseApiClient {
    private parser: Parser;

    constructor() {
        super({
            baseUrl: "", // Not used as we fetch from various URLs
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
            },
            cache: {
                ttl: 3600000, // 1 hour
                enabled: true,
            },
        });
        this.parser = new Parser();
    }

    /**
     * Fetch podcast metadata from RSS feed
     */
    async fetchPodcastMetadata(rssUrl: string): Promise<PodcastMetadata | null> {
        try {
            const feedContent = await this.requestFeed(rssUrl);
            const feed = await this.parser.parseString(feedContent);

            if (!feed) {
                return null;
            }

            // Extract episodes (limit to last 5)
            const episodes = (feed.items || []).slice(0, 5).map((item) => ({
                title: item.title || "Untitled Episode",
                published: item.pubDate || new Date().toISOString(),
                duration: item.itunes?.duration,
                url: item.enclosure?.url || item.link,
                image: item.itunes?.image,
            }));

            return {
                title: feed.title || "",
                description: feed.description || "",
                image: feed.image?.url || feed.itunes?.image,
                author: feed.itunes?.author || feed.author,
                link: feed.link,
                lastBuildDate: feed.lastBuildDate || feed.pubDate,
                episodes,
            };
        } catch (error) {
            console.error(`Failed to fetch podcast metadata from ${rssUrl}:`, error);
            return null;
        }
    }

    /**
     * Fetch RSS feed content
     */
    private async requestFeed(url: string): Promise<string> {
        await this.checkRateLimit();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "AwesomeList-Builder/1.0",
                    Accept: "application/rss+xml, application/xml, text/xml",
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
            }

            return await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
}

export const podcastClient = new PodcastClient();
