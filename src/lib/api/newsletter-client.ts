/**
 * Newsletter API Client using RSS feeds
 */

import {XMLParser} from "fast-xml-parser";
import type {NewsletterMetadata} from "@/schema/ts/newsletter.interface.ts";
import {ApiError, BaseApiClient} from "./base-client.ts";

export class NewsletterClient extends BaseApiClient {
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
   * Fetch newsletter metadata from RSS feed
   */
  async fetchNewsletterMetadata(rssUrl: string): Promise<NewsletterMetadata | null> {
    try {
      const feedContent = await this.requestFeed(rssUrl);
      const feed = this.parser.parse(feedContent);

      // Handle both RSS 2.0 and Atom feeds
      if (feed?.rss?.channel) {
        return this.parseRssFeed(feed.rss.channel);
      } else if (feed?.feed) {
        return this.parseAtomFeed(feed.feed);
      }

      console.warn(`Invalid feed structure for ${rssUrl}`);
      return null;
    } catch (error) {
      console.error(`Failed to fetch newsletter metadata from ${rssUrl}:`, error);
      return null;
    }
  }

  /**
   * Parse RSS 2.0 feed
   */
  private parseRssFeed(channel: any): NewsletterMetadata {
    // Handle single item vs array of items
    const items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

    // Get the latest item for latestIssue
    const latestItem = items[0];

    // Try to extract frequency from channel or items
    const frequency = this.extractFrequency(channel, items);

    // Try to find the first issue date from oldest item
    const firstIssue = items.length > 0 ? items[items.length - 1]?.pubDate : undefined;

    return {
      title: channel.title || "Untitled Newsletter",
      description: channel.description || "",
      link: channel.link || rssUrl,
      image: channel.image?.url || channel["itunes:image"]?.["@_href"],
      author: channel["dc:creator"] || channel.author || channel["itunes:author"],
      authorUrl: channel["atom:link"]?.["@_href"],
      language: channel.language,
      copyright: channel.copyright,
      lastBuildDate: channel.lastBuildDate || channel.pubDate,
      frequency: frequency,
      firstIssue: firstIssue,
      latestIssue: latestItem
        ? {
            title: latestItem.title || "Latest Issue",
            published: latestItem.pubDate || new Date().toISOString(),
            url: latestItem.link || latestItem.guid,
          }
        : undefined,
    };
  }

  /**
   * Parse Atom feed
   */
  private parseAtomFeed(feed: any): NewsletterMetadata {
    const entries = feed.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];

    // Get the latest entry for latestIssue
    const latestEntry = entries[0];

    const link = Array.isArray(feed.link) ? feed.link[0] : feed.link;
    const linkHref = link?.["@_href"] || link;

    // Try to find the first issue date from oldest entry
    const firstIssue = entries.length > 0 ? entries[entries.length - 1]?.published : undefined;

    return {
      title: feed.title || "Untitled Newsletter",
      description: feed.subtitle || "",
      link: linkHref,
      image: feed.logo || feed.icon,
      author: feed.author?.name || feed["dc:creator"],
      authorUrl: feed.author?.uri,
      language: feed["xml:lang"],
      lastBuildDate: feed.updated,
      firstIssue: firstIssue,
      latestIssue: latestEntry
        ? {
            title: latestEntry.title || "Latest Issue",
            published: latestEntry.published || latestEntry.updated || new Date().toISOString(),
            url: Array.isArray(latestEntry.link)
              ? latestEntry.link[0]?.["@_href"]
              : latestEntry.link?.["@_href"] || latestEntry.link,
          }
        : undefined,
    };
  }

  /**
   * Try to extract frequency from feed metadata
   * This is a best-effort approach as frequency is not standardized in RSS
   */
  private extractFrequency(channel: any, items: any[]): string | undefined {
    // Check if there's an explicit frequency in the feed
    if (channel["sy:updateFrequency"]) {
      return channel["sy:updateFrequency"];
    }

    // Try to infer from title or description
    const text = `${channel.title} ${channel.description}`.toLowerCase();
    if (text.includes("daily")) return "daily";
    if (text.includes("weekly")) return "weekly";
    if (text.includes("biweekly") || text.includes("bi-weekly")) return "biweekly";
    if (text.includes("monthly")) return "monthly";
    if (text.includes("quarterly")) return "quarterly";

    // Try to infer from publishing pattern of recent items
    if (items.length >= 3) {
      const dates = items
        .slice(0, 3)
        .map((item: any) => new Date(item.pubDate))
        .filter((d: Date) => !isNaN(d.getTime()));

      if (dates.length >= 2) {
        const avgDaysBetween =
          dates.slice(1).reduce((sum: number, date: Date, i: number) => {
            return sum + (dates[i].getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) /
          (dates.length - 1);

        if (avgDaysBetween < 2) return "daily";
        if (avgDaysBetween >= 2 && avgDaysBetween < 10) return "weekly";
        if (avgDaysBetween >= 10 && avgDaysBetween < 20) return "biweekly";
        if (avgDaysBetween >= 20 && avgDaysBetween < 60) return "monthly";
      }
    }

    return undefined;
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
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        },
        signal: controller.signal,
        redirect: "follow",
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

export const newsletterClient = new NewsletterClient();
