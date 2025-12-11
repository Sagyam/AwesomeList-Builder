import type { BaseResource } from "@/schema/ts/base.interface.ts";
import type { AccessLevel, Difficulty } from "@/schema/ts/types.ts";

export interface PodcastEpisode {
  title: string;
  published: string;
  duration?: string;
  url?: string;
  image?: string;
}

export interface PodcastMetadata {
  title: string;
  description: string;
  link: string; // url
  image?: string;
  author?: string; // host
  copyright?: string;
  language?: string;
  lastBuildDate?: string;
  itunesId?: string;
  episodes: PodcastEpisode[];
}

export interface Podcast {
  type: "podcast";
  id: string;
  rssFeed: string;

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

  // Optional user overrides
  platform?: string;
  hostUrl?: string; // User override for landing page if different from RSS link

  // Auto-extracted fields
  metadata: PodcastMetadata;
}
