/**
 * Video Resource Schema
 *
 * User provides ONLY: type, id, videoId
 * Everything else is auto-fetched from YouTube Data API v3
 */

export interface VideoThumbnails {
  default?: {
    url: string;
    width: number;
    height: number;
  };
  medium?: {
    url: string;
    width: number;
    height: number;
  };
  high?: {
    url: string;
    width: number;
    height: number;
  };
  standard?: {
    url: string;
    width: number;
    height: number;
  };
  maxres?: {
    url: string;
    width: number;
    height: number;
  };
}

export interface VideoChannel {
  id: string;
  title: string;
  customUrl?: string;
  thumbnails?: VideoThumbnails;
}

export interface VideoStatistics {
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
}

export interface VideoContentDetails {
  duration: string; // ISO 8601 format (e.g., PT15M30S)
  dimension: string; // "2d" or "3d"
  definition: string; // "hd" or "sd"
  caption: boolean; // Has captions/subtitles
  licensedContent: boolean;
  projection: string; // "rectangular" or "360"
}

export interface VideoLocalization {
  title: string;
  description: string;
}

export interface VideoTopicDetails {
  topicIds?: string[];
  relevantTopicIds?: string[];
  topicCategories?: string[];
}

export interface VideoStatus {
  uploadStatus: string;
  privacyStatus: string; // "public", "unlisted", "private"
  license: string; // "youtube" or "creativeCommon"
  embeddable: boolean;
  publicStatsViewable: boolean;
  madeForKids: boolean;
}

/**
 * Comprehensive video metadata auto-extracted from YouTube Data API v3
 */
export interface VideoMetadata {
  // Core video information
  title: string;
  description: string;
  publishedAt: string; // ISO timestamp

  // Channel information
  channel: VideoChannel;

  // Visual assets
  thumbnails: VideoThumbnails;

  // Statistics
  statistics: VideoStatistics;

  // Content details
  contentDetails: VideoContentDetails;

  // Localization (if available)
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  localizations?: Record<string, VideoLocalization>;

  // Topics & categories
  categoryId?: string;
  categoryName?: string; // Human-readable category name
  topicDetails?: VideoTopicDetails;

  // Tags
  tags?: string[];

  // Status information
  status?: VideoStatus;

  // Live streaming details (if applicable)
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    concurrentViewers?: number;
  };

  // Metadata about the metadata
  fetchedAt: string; // ISO timestamp
  etag: string; // YouTube API etag for caching
}

/**
 * Video Resource
 * User provides ONLY: type, id, videoId
 * All other fields are auto-generated from YouTube API
 */
export interface Video {
  type: "video";
  id: string;
  videoId: string; // YouTube video ID (user provided)

  // Everything else is auto-fetched
  metadata: VideoMetadata;
}
