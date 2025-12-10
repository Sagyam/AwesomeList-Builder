import type {AccessLevel, Difficulty, Types} from "./types.ts";

export interface BaseResource {
  // Required
  type: Types;
  id: string;
  title?: string; // title OR name required
  name?: string;
  url: string;
  description: string;
  category: string;

  // Mandatory
  tags: string[];
  topics: string[];
  language: string;
  dateAdded: string; // ISO 8601
  lastVerified: string; // ISO 8601

  // Optional but useful
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

  // Visual
  image?: string; // URL or path to image/screenshot
  imageAlt?: string; // Alt text for accessibility
}

/**
 * DisplayResource is the shape of resource data used by UI components
 * This is created by transforming BaseResource for display purposes
 */
export interface DisplayResource {
  id: string;
  name: string;
  description: string;
  url: string;
  type: Types;
  category?: string;
  language?: string;
  languages?: string[];
  stars?: number;
  license?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  archived?: boolean;
  trending?: boolean;
  featured?: boolean;
  registry?: "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";
  packageName?: string;
  lastReleaseVersion?: string;
  downloads?: string;
}
