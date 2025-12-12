/**
 * YouTube API Client - Fetches from YouTube Data API v3
 * Retrieves comprehensive video metadata including statistics, content details, and more
 */

import type {VideoMetadata, VideoThumbnails} from "@/schema/ts/video.interface.ts";
import {BaseApiClient} from "./base-client.ts";

// ===== YouTube Data API v3 Types =====
interface YouTubeThumbnail {
    url: string;
    width: number;
    height: number;
}

interface YouTubeThumbnails {
    default?: YouTubeThumbnail;
    medium?: YouTubeThumbnail;
    high?: YouTubeThumbnail;
    standard?: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
}

interface YouTubeSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    defaultLanguage?: string;
    defaultAudioLanguage?: string;
    localized?: {
        title: string;
        description: string;
    };
}

interface YouTubeContentDetails {
    duration: string;
    dimension: string;
    definition: string;
    caption: string; // "true" or "false" as string
    licensedContent: boolean;
    projection: string;
}

interface YouTubeStatistics {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
    favoriteCount?: string;
}

interface YouTubeStatus {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
}

interface YouTubeTopicDetails {
    topicIds?: string[];
    relevantTopicIds?: string[];
    topicCategories?: string[];
}

interface YouTubeLiveStreamingDetails {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    concurrentViewers?: string;
}

interface YouTubeVideo {
    kind: string;
    etag: string;
    id: string;
    snippet: YouTubeSnippet;
    contentDetails: YouTubeContentDetails;
    status: YouTubeStatus;
    statistics: YouTubeStatistics;
    topicDetails?: YouTubeTopicDetails;
    liveStreamingDetails?: YouTubeLiveStreamingDetails;
}

interface YouTubeVideosResponse {
    kind: string;
    etag: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeVideo[];
}

interface YouTubeChannelSnippet {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: YouTubeThumbnails;
}

interface YouTubeChannel {
    kind: string;
    etag: string;
    id: string;
    snippet: YouTubeChannelSnippet;
}

interface YouTubeChannelsResponse {
    kind: string;
    etag: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeChannel[];
}

interface YouTubeVideoCategorySnippet {
    title: string;
    assignable: boolean;
    channelId: string;
}

interface YouTubeVideoCategory {
    kind: string;
    etag: string;
    id: string;
    snippet: YouTubeVideoCategorySnippet;
}

interface YouTubeVideoCategoriesResponse {
    kind: string;
    etag: string;
    items: YouTubeVideoCategory[];
}

export class YouTubeClient extends BaseApiClient {
    private apiKey: string;
    private categoryCache: Map<string, string> = new Map();

    constructor() {
        super({
            baseUrl: "https://www.googleapis.com/youtube/v3",
            rateLimit: {
                requestsPerMinute: 100,
                requestsPerHour: 10000, // YouTube API has daily quota, not hourly
            },
            cache: {
                ttl: 3600000, // 1 hour (video stats change frequently)
                enabled: true,
            },
        });

        // YouTube API key is required
        const apiKey = process.env.YOUTUBE_TOKEN || process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            throw new Error("YOUTUBE_TOKEN or YOUTUBE_API_KEY environment variable is required");
        }
        this.apiKey = apiKey;
    }

    /**
     * Fetch comprehensive video metadata from YouTube Data API v3
     */
    async fetchVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
        try {
            // Fetch video details with all parts
            const videoData = await this.fetchVideoDetails(videoId);

            if (!videoData) {
                console.warn(`No metadata found for video ID: ${videoId}`);
                return null;
            }

            // Fetch channel details separately for additional info
            const channelData = await this.fetchChannelDetails(videoData.snippet.channelId);

            // Fetch category name
            const categoryName = await this.fetchCategoryName(videoData.snippet.categoryId);

            // Build metadata object
            return this.buildMetadata(videoData, channelData, categoryName);
        } catch (error) {
            console.error(`Failed to fetch video metadata for ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Extract video ID from various YouTube URL formats
     */
    extractVideoId(url: string): string | null {
        // youtube.com/watch?v=VIDEO_ID
        const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (watchMatch) return watchMatch[1];

        // youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch) return shortMatch[1];

        // youtube.com/embed/VIDEO_ID
        const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];

        // youtube.com/v/VIDEO_ID
        const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
        if (vMatch) return vMatch[1];

        // If it's already just the ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }

        return null;
    }

    /**
     * Fetch video details from YouTube API
     */
    private async fetchVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
        try {
            const parts = [
                "snippet",
                "contentDetails",
                "statistics",
                "status",
                "topicDetails",
                "liveStreamingDetails",
            ].join(",");

            const response = await this.request<YouTubeVideosResponse>(
                `/videos?part=${parts}&id=${videoId}&key=${this.apiKey}`
            );

            if (!response || !response.items || response.items.length === 0) {
                console.log(`YouTube API: No video found for ID ${videoId}`);
                return null;
            }

            return response.items[0];
        } catch (error) {
            console.error(`YouTube API error for video ${videoId}:`, error);
            return null;
        }
    }

    /**
     * Fetch channel details from YouTube API
     */
    private async fetchChannelDetails(channelId: string): Promise<YouTubeChannel | null> {
        try {
            const response = await this.request<YouTubeChannelsResponse>(
                `/channels?part=snippet&id=${channelId}&key=${this.apiKey}`
            );

            if (!response || !response.items || response.items.length === 0) {
                console.log(`YouTube API: No channel found for ID ${channelId}`);
                return null;
            }

            return response.items[0];
        } catch (error) {
            console.error(`YouTube API error for channel ${channelId}:`, error);
            return null;
        }
    }

    /**
     * Fetch category name from YouTube API (with caching)
     */
    private async fetchCategoryName(categoryId: string): Promise<string | undefined> {
        // Check cache first
        if (this.categoryCache.has(categoryId)) {
            return this.categoryCache.get(categoryId);
        }

        try {
            const response = await this.request<YouTubeVideoCategoriesResponse>(
                `/videoCategories?part=snippet&id=${categoryId}&key=${this.apiKey}`
            );

            if (response && response.items && response.items.length > 0) {
                const categoryName = response.items[0].snippet.title;
                this.categoryCache.set(categoryId, categoryName);
                return categoryName;
            }
        } catch (error) {
            console.error(`YouTube API error for category ${categoryId}:`, error);
        }

        return undefined;
    }

    /**
     * Build unified metadata from YouTube API responses
     */
    private buildMetadata(
        video: YouTubeVideo,
        channel: YouTubeChannel | null,
        categoryName?: string
    ): VideoMetadata {
        const {snippet, contentDetails, statistics, status, topicDetails, liveStreamingDetails} =
            video;

        // Convert thumbnails
        const thumbnails: VideoThumbnails = {
            default: snippet.thumbnails.default,
            medium: snippet.thumbnails.medium,
            high: snippet.thumbnails.high,
            standard: snippet.thumbnails.standard,
            maxres: snippet.thumbnails.maxres,
        };

        return {
            // Core video information
            title: snippet.title,
            description: snippet.description,
            publishedAt: snippet.publishedAt,

            // Channel information
            channel: {
                id: snippet.channelId,
                title: snippet.channelTitle,
                customUrl: channel?.snippet.customUrl,
                thumbnails: channel?.snippet.thumbnails,
            },

            // Visual assets
            thumbnails,

            // Statistics (convert strings to numbers)
            statistics: {
                viewCount: statistics.viewCount ? parseInt(statistics.viewCount, 10) : 0,
                likeCount: statistics.likeCount ? parseInt(statistics.likeCount, 10) : undefined,
                commentCount: statistics.commentCount ? parseInt(statistics.commentCount, 10) : undefined,
                favoriteCount: statistics.favoriteCount
                    ? parseInt(statistics.favoriteCount, 10)
                    : undefined,
            },

            // Content details
            contentDetails: {
                duration: contentDetails.duration,
                dimension: contentDetails.dimension,
                definition: contentDetails.definition,
                caption: contentDetails.caption === "true",
                licensedContent: contentDetails.licensedContent,
                projection: contentDetails.projection,
            },

            // Localization
            defaultLanguage: snippet.defaultLanguage,
            defaultAudioLanguage: snippet.defaultAudioLanguage,

            // Topics & categories
            categoryId: snippet.categoryId,
            categoryName,
            topicDetails,

            // Tags
            tags: snippet.tags,

            // Status
            status,

            // Live streaming details (convert concurrent viewers to number)
            liveStreamingDetails: liveStreamingDetails
                ? {
                    actualStartTime: liveStreamingDetails.actualStartTime,
                    actualEndTime: liveStreamingDetails.actualEndTime,
                    scheduledStartTime: liveStreamingDetails.scheduledStartTime,
                    scheduledEndTime: liveStreamingDetails.scheduledEndTime,
                    concurrentViewers: liveStreamingDetails.concurrentViewers
                        ? parseInt(liveStreamingDetails.concurrentViewers, 10)
                        : undefined,
                }
                : undefined,

            // Metadata about the metadata
            fetchedAt: new Date().toISOString(),
            etag: video.etag,
        };
    }
}

export const youtubeClient = new YouTubeClient();
