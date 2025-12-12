/**
 * Certification Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, certificationUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from certification page
 */

export interface CertificationMetadata {
  // Core information
  title: string;
  description: string;
  provider: string;
  providerUrl?: string;

  // Certification details
  examCode?: string;
  duration?: string; // Validity duration (e.g., "3 years", "lifetime")
  examDuration?: string; // Exam length
  cost?: string;
  prerequisites?: string[];
  format?: string; // Online, In-person, Proctored, etc.
  passingScore?: number;
  renewalRequired?: boolean;

  // Additional metadata
  recognizedBy?: string[]; // Organizations that recognize this cert
  image?: string; // Logo or badge image
  language?: string;
  difficultyLevel?: string;
  topics?: string[];

  // Metadata about the metadata
  fetchedAt: string; // ISO timestamp
  lastUpdated?: string; // When certification info was last updated
}

/**
 * Certification Resource
 * User provides ONLY: type, id, certificationUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Certification {
  type: "certification";
  id: string;
  certificationUrl: string; // User provided URL to certification page

  // Required base fields
  category: string;
  tags: string[];

  // Optional user-provided subjective flags
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;

  // Everything else is auto-fetched
  metadata: CertificationMetadata;
}
