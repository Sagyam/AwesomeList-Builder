import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Podcast extends BaseResource {
  type: "podcast";
  title: string;
  host: string;
  hostUrl?: string;
  platform?: string; // Spotify, Apple Podcasts, etc.
  rssFeed?: string;
  episodeNumber?: number;
  season?: number;
  published: string;
  duration?: string; // ISO 8601 duration
  thumbnail?: string;
  explicit?: boolean;
  transcript?: string;
}
