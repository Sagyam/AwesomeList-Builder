/**
 * Article API Client using RSS/Atom feeds
 */

import {XMLParser} from "fast-xml-parser";
import type {ArticleMetadata} from "@/schema/ts/article.interface.ts";
import {ApiError, BaseApiClient} from "./base-client.ts";

export class ArticleClient extends BaseApiClient {
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
   * Fetch article metadata from RSS/Atom feed or direct URL
   */
  async fetchArticleMetadata(url: string, rssUrl?: string): Promise<ArticleMetadata | null> {
    try {
      // If RSS URL is provided, fetch from RSS feed
      if (rssUrl) {
        return await this.fetchFromRss(rssUrl, url);
      }

      // Otherwise try to fetch metadata from the article page itself
      return await this.fetchFromArticlePage(url);
    } catch (error) {
      console.error(`Failed to fetch article metadata from ${url}:`, error);
      return null;
    }
  }

  /**
   * Fetch article metadata from RSS feed
   */
  private async fetchFromRss(rssUrl: string, targetUrl: string): Promise<ArticleMetadata | null> {
    try {
      const feedContent = await this.requestFeed(rssUrl);
      const feed = this.parser.parse(feedContent);

      // Handle both RSS 2.0 and Atom feeds
      if (feed?.rss?.channel) {
        return this.parseRssFeed(feed.rss.channel, targetUrl);
      } else if (feed?.feed) {
        return this.parseAtomFeed(feed.feed, targetUrl);
      }

      console.warn(`Invalid feed structure for ${rssUrl}`);
      return null;
    } catch (error) {
      console.error(`Failed to fetch from RSS: ${rssUrl}`, error);
      return null;
    }
  }

  /**
   * Parse RSS 2.0 feed
   */
  private parseRssFeed(channel: any, targetUrl: string): ArticleMetadata | null {
    const items = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

    // Find the matching article by URL
    const article = items.find((item: any) => item.link === targetUrl || item.guid === targetUrl);

    if (!article) {
      // If no exact match, use the first item or channel info
      const firstItem = items[0];
      if (firstItem) {
        return this.extractArticleFromRssItem(firstItem);
      }
      // Fallback to channel info
      return {
        title: channel.title || "Untitled",
        description: channel.description || "",
        link: targetUrl,
        image: channel.image?.url,
        author: channel["dc:creator"] || channel.author,
      };
    }

    return this.extractArticleFromRssItem(article);
  }

  /**
   * Extract article metadata from RSS item
   */
  private extractArticleFromRssItem(item: any): ArticleMetadata {
    return {
      title: item.title || "Untitled",
      description: item.description || item["content:encoded"] || "",
      link: item.link || item.guid,
      image: item["media:thumbnail"]?.["@_url"] || item.enclosure?.["@_url"],
      author: item["dc:creator"] || item.author,
      published: item.pubDate || item["dc:date"],
      updated: item["atom:updated"],
      summary: item.description,
      content: item["content:encoded"],
      keywords: this.parseKeywords(item.category),
      category: Array.isArray(item.category) ? item.category[0] : item.category,
    };
  }

  /**
   * Parse Atom feed
   */
  private parseAtomFeed(feed: any, targetUrl: string): ArticleMetadata | null {
    const entries = feed.entry ? (Array.isArray(feed.entry) ? feed.entry : [feed.entry]) : [];

    // Find the matching article by URL
    const article = entries.find((entry: any) => {
      const link = Array.isArray(entry.link) ? entry.link[0] : entry.link;
      const href = link?.["@_href"] || link;
      return href === targetUrl;
    });

    if (!article) {
      const firstEntry = entries[0];
      if (firstEntry) {
        return this.extractArticleFromAtomEntry(firstEntry);
      }
      return null;
    }

    return this.extractArticleFromAtomEntry(article);
  }

  /**
   * Extract article metadata from Atom entry
   */
  private extractArticleFromAtomEntry(entry: any): ArticleMetadata {
    const link = Array.isArray(entry.link) ? entry.link[0] : entry.link;
    const linkHref = link?.["@_href"] || link;

    return {
      title: entry.title || "Untitled",
      description: entry.summary || entry.content || "",
      link: linkHref,
      image: entry["media:thumbnail"]?.["@_url"],
      author: entry.author?.name || entry["dc:creator"],
      authorUrl: entry.author?.uri,
      published: entry.published || entry.updated,
      updated: entry.updated,
      summary: entry.summary,
      content: entry.content,
      keywords: this.parseKeywords(entry.category),
      category: Array.isArray(entry.category)
        ? entry.category[0]?.["@_term"]
        : entry.category?.["@_term"],
    };
  }

  /**
   * Fetch article metadata from the article page itself
   * This is a basic implementation that could be enhanced with proper HTML parsing
   */
  private async fetchFromArticlePage(url: string): Promise<ArticleMetadata | null> {
    try {
      const html = await this.requestFeed(url);

      // Basic regex-based extraction of meta tags
      // This is a simplified approach - a proper implementation would use a HTML parser
      const metadata: ArticleMetadata = {
        title:
          this.extractMetaTag(html, "og:title") ||
          this.extractMetaTag(html, "twitter:title") ||
          this.extractTitle(html) ||
          "Untitled",
        description:
          this.extractMetaTag(html, "og:description") ||
          this.extractMetaTag(html, "twitter:description") ||
          this.extractMetaTag(html, "description") ||
          "",
        link: url,
        image: this.extractMetaTag(html, "og:image") || this.extractMetaTag(html, "twitter:image"),
        author: this.extractMetaTag(html, "author") || this.extractMetaTag(html, "article:author"),
        published: this.extractMetaTag(html, "article:published_time"),
        updated: this.extractMetaTag(html, "article:modified_time"),
        keywords: this.extractMetaTag(html, "keywords")
          ?.split(",")
          .map((k) => k.trim()),
      };

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch from article page: ${url}`, error);
      return null;
    }
  }

  /**
   * Extract meta tag content from HTML
   */
  private extractMetaTag(html: string, property: string): string | undefined {
    // Try property attribute (Open Graph)
    let regex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      "i"
    );
    let match = html.match(regex);
    if (match) return match[1];

    // Try name attribute
    regex = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
    match = html.match(regex);
    if (match) return match[1];

    return undefined;
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title>([^<]*)<\/title>/i);
    return match?.[1];
  }

  /**
   * Parse keywords from category field
   */
  private parseKeywords(category: any): string[] | undefined {
    if (!category) return undefined;
    if (Array.isArray(category)) {
      return category.map((c) => (typeof c === "string" ? c : c?.["@_term"] || c)).filter(Boolean);
    }
    return typeof category === "string" ? [category] : undefined;
  }

  /**
   * Fetch RSS feed or web page content
   * Automatically follows redirects (fetch does this by default)
   */
  private async requestFeed(url: string): Promise<string> {
    await this.checkRateLimit();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "AwesomeList-Builder/1.0",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html",
        },
        signal: controller.signal,
        redirect: "follow", // Explicitly follow redirects
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

export const articleClient = new ArticleClient();
