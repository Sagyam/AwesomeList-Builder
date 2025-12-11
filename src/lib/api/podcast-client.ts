/**
 * Podcast API Client using RSS feeds
 */

import { XMLParser } from "fast-xml-parser";
import { BaseApiClient, ApiError } from "./base-client.ts";
import type { PodcastMetadata } from "@/schema/ts/podcast.interface.ts";

export class PodcastClient extends BaseApiClient {
    private parser: XMLParser;

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
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            textNodeName: "#text",
        });
    }

    /**
     * Fetch podcast metadata from RSS feed
     */
    async fetchPodcastMetadata(rssUrl: string): Promise<PodcastMetadata | null> {
        try {
            const feedContent = await this.requestFeed(rssUrl);
            const feed = this.parser.parse(feedContent);

            if (!feed?.rss?.channel) {
                console.warn(`Invalid RSS feed structure for ${rssUrl}`);
                return null;
            }

            const channel = feed.rss.channel;
            // Handle single item vs array of items
            const items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

            const episodes = items.slice(0, 5).map((item: any) => {
                const enclosure = item.enclosure ? (Array.isArray(item.enclosure) ? item.enclosure[0] : item.enclosure) : null;
                return {
                    title: item.title,
                    published: item.pubDate || new Date().toISOString(),
                    duration: item["itunes:duration"] ? String(item["itunes:duration"]) : undefined,
                    url: enclosure?.["@_url"] || item.link,
                    image: item["itunes:image"]?.["@_href"],
                };
            });

            return {
                title: channel.title,
                description: channel.description,
                link: channel.link,
                image: channel.image?.url || channel["itunes:image"]?.["@_href"],
                author: channel["itunes:author"] || channel["googleplay:author"] || channel.author,
                lastBuildDate: channel.lastBuildDate || channel.pubDate,
                language: channel.language,
                copyright: channel.copyright,
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
