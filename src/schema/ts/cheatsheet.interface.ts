/**
 * Cheatsheet Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, cheatsheetUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from cheatsheet page
 */

export interface CheatsheetMetadata {
  // Core information
  title: string;
  description: string;
  author?: string;
  authorUrl?: string;

  // Cheatsheet details
  subject: string;
  topics?: string[];
  published?: string;
  updated?: string;
  format?: string; // PDF, HTML, Image, Interactive, etc.
  pages?: number;
  downloadUrl?: string;
  printable?: boolean;
  interactive?: boolean;
  version?: string;

  // Additional metadata
  image?: string; // Preview image or thumbnail
  language?: string;
  license?: string;
  fileSize?: string;

  // Metadata about the metadata
  fetchedAt: string; // ISO timestamp
}

/**
 * Cheatsheet Resource
 * User provides ONLY: type, id, cheatsheetUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Cheatsheet {
  type: "cheatsheet";
  id: string;
  cheatsheetUrl: string; // User provided URL to cheatsheet page

  // Required base fields
  category: string;
  tags: string[];

  // Optional user-provided subjective flags
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;

  // Everything else is auto-fetched
  metadata: CheatsheetMetadata;
}
