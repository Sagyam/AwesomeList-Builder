/**
 * Documentation Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, documentationUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from documentation page
 */

export interface DocumentationMetadata {
    // Core information
  title: string;
    description: string;
  project?: string;
    projectUrl?: string;

    // Documentation details
  version?: string;
    versions?: string[]; // Available versions
  repository?: string;
  format?: string; // HTML, PDF, Markdown, etc.
  sections?: string[];
  searchable?: boolean;
  interactive?: boolean;
  lastUpdated?: string;

    // Additional metadata
  officialDocs?: boolean;
    maintainer?: string;
    license?: string;
    image?: string; // Project logo or icon
    language?: string;
    languages?: string[]; // Available language translations
    topics?: string[];

    // Metadata about the metadata
    fetchedAt: string; // ISO timestamp
}

/**
 * Documentation Resource
 * User provides ONLY: type, id, documentationUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Documentation {
    type: "documentation";
    id: string;
    documentationUrl: string; // User provided URL to documentation page

    // Required base fields
    category: string;
    tags: string[];

    // Optional user-provided subjective flags
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;

    // Everything else is auto-fetched
    metadata: DocumentationMetadata;
}
