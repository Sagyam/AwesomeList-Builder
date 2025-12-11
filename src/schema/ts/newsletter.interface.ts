import type {AccessLevel, Difficulty} from "@/schema/ts/types.ts";

export interface NewsletterMetadata {
  title: string;
  description: string;
  link: string; // canonical URL
  image?: string;
  author?: string;
  authorUrl?: string;
  language?: string;
  copyright?: string;
  lastBuildDate?: string;
  // Newsletter-specific metadata from RSS
  subscribers?: number;
  frequency?: string; // Extracted from RSS if available
  firstIssue?: string;
  latestIssue?: {
    title: string;
    published: string;
    url?: string;
  };
}

export interface Newsletter {
  type: "newsletter";
  id: string;
  rssUrl: string; // RSS feed URL (required for newsletters)

  // User defined fields (Mandatory)
  tags: string[];
  topics: string[];
  category: string;
  language: string;
  dateAdded: string;
  lastVerified: string;

  // User defined fields (Optional)
  featured?: boolean;
  trending?: boolean;
  relatedResources?: string[];
  difficulty?: Difficulty;
  isFree?: boolean;
  isPaid?: boolean;
  requiresSignup?: boolean;
  accessLevel?: AccessLevel;

  // Optional user overrides
  platform?: string; // e.g., "Substack", "Mailchimp", "Cooperpress", "Independent"
  format?: "email" | "web" | "both";
  subscribeUrl?: string; // Custom subscribe URL if different from rssUrl
  archiveUrl?: string; // Archive page URL
  image?: string; // User-provided cover image (fallback if RSS doesn't provide one)
  imageAlt?: string; // Alt text for the image

  // Auto-extracted fields from RSS
  metadata: NewsletterMetadata;
}
