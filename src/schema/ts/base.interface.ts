import type { AccessLevel, Difficulty, Types } from "./types.ts";

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
}
