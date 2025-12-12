/**
 * Tool Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, toolUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from tool homepage
 */

export interface ToolMetadata {
    // Core information
  name: string;
    description: string;
    tagline?: string;

    // Tool links
  homepage?: string;
  repository?: string;
  documentation?: string;
    downloadUrl?: string;

    // Tool details
  license?: string;
    platforms?: string[]; // Windows, macOS, Linux, Web, iOS, Android
  features?: string[];
    category?: string;
  version?: string;
  lastUpdated?: string;

    // Pricing
    pricing?: string; // Free, Freemium, Paid, Open Source
    pricingUrl?: string;
    isOpenSource?: boolean;

    // Additional metadata
    developer?: string;
    developerUrl?: string;
    image?: string; // Tool logo or screenshot
    language?: string;
    topics?: string[];
    requirements?: string[];

    // Metadata about the metadata
    fetchedAt: string; // ISO timestamp
}

/**
 * Tool Resource
 * User provides ONLY: type, id, toolUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Tool {
    type: "tool";
    id: string;
    toolUrl: string; // User provided URL to tool homepage

    // Required base fields
    category: string;
    tags: string[];

    // Optional user-provided subjective flags
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;

    // Everything else is auto-fetched
    metadata: ToolMetadata;
}
