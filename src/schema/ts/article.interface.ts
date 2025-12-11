import type {AccessLevel, Difficulty} from "@/schema/ts/types.ts";

export interface ArticleMetadata {
  title: string;
  description: string;
  link: string; // canonical URL
  image?: string;
  author?: string;
  authorUrl?: string;
  published?: string;
  updated?: string;
  readTime?: string;
  summary?: string;
  content?: string; // Full content if available
  keywords?: string[];
  category?: string;
}

export interface Article {
  type: "article";
  id: string;
  url: string; // Article URL
  rssUrl?: string; // Optional RSS feed URL

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
  archived?: boolean;
  deprecated?: boolean;
  replacedBy?: string;
  relatedResources?: string[];
  difficulty?: Difficulty;
  isFree?: boolean;
  isPaid?: boolean;
  requiresSignup?: boolean;
  accessLevel?: AccessLevel;
  paywall?: boolean;

  // Optional user overrides
  platform?: string; // e.g., "Medium", "Dev.to", "Personal Blog"
  format?: string; // e.g., "tutorial", "opinion", "case-study"

  // Auto-extracted fields
  metadata: ArticleMetadata;
}
