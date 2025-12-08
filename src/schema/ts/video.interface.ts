import type { BaseResource } from "@/schema";

export interface Video extends BaseResource {
  type: "video";
  title: string;
  platform: string;
  creator: string;
  creatorUrl?: string;
  channel?: string;
  thumbnail?: string;
  published: string;
  duration: string; // ISO 8601
  hasSubtitles?: boolean;
  views?: number;
  quality?: string;
}
