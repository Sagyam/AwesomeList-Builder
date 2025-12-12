import {z} from "zod";

/**
 * Video Schema - Minimal user input (type, id, videoId only)
 * All other data is auto-fetched from YouTube Data API v3
 */

export const VideoThumbnailItemSchema = z.object({
    url: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
});

export const VideoThumbnailsSchema = z.object({
    default: VideoThumbnailItemSchema.optional(),
    medium: VideoThumbnailItemSchema.optional(),
    high: VideoThumbnailItemSchema.optional(),
    standard: VideoThumbnailItemSchema.optional(),
    maxres: VideoThumbnailItemSchema.optional(),
});

export const VideoChannelSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    customUrl: z.string().optional(),
    thumbnails: VideoThumbnailsSchema.optional(),
});

export const VideoStatisticsSchema = z.object({
    viewCount: z.number().int().nonnegative(),
    likeCount: z.number().int().nonnegative().optional(),
    commentCount: z.number().int().nonnegative().optional(),
    favoriteCount: z.number().int().nonnegative().optional(),
});

export const VideoContentDetailsSchema = z.object({
  duration: z
    .string()
    .regex(
      /^PT(\d+H)?(\d+M)?(\d+S)?$/,
      "Duration must be in ISO 8601 format (e.g., PT1H30M for 1 hour 30 minutes)"
    ),
    dimension: z.string(),
    definition: z.string(),
    caption: z.boolean(),
    licensedContent: z.boolean(),
    projection: z.string(),
});

export const VideoLocalizationSchema = z.object({
    title: z.string(),
    description: z.string(),
});

export const VideoTopicDetailsSchema = z.object({
    topicIds: z.array(z.string()).optional(),
    relevantTopicIds: z.array(z.string()).optional(),
    topicCategories: z.array(z.string()).optional(),
});

export const VideoStatusSchema = z.object({
    uploadStatus: z.string(),
    privacyStatus: z.string(),
    license: z.string(),
    embeddable: z.boolean(),
    publicStatsViewable: z.boolean(),
    madeForKids: z.boolean(),
});

export const VideoLiveStreamingDetailsSchema = z.object({
    actualStartTime: z.string().optional(),
    actualEndTime: z.string().optional(),
    scheduledStartTime: z.string().optional(),
    scheduledEndTime: z.string().optional(),
    concurrentViewers: z.number().int().nonnegative().optional(),
});

export const VideoMetadataSchema = z.object({
    // Core video information
    title: z.string().min(1, "Video title is required"),
    description: z.string(),
    publishedAt: z.string(),

    // Channel information
    channel: VideoChannelSchema,

    // Visual assets
    thumbnails: VideoThumbnailsSchema,

    // Statistics
    statistics: VideoStatisticsSchema,

    // Content details
    contentDetails: VideoContentDetailsSchema,

    // Localization
    defaultLanguage: z.string().optional(),
    defaultAudioLanguage: z.string().optional(),
    localizations: z.record(z.string(), VideoLocalizationSchema).optional(),

    // Topics & categories
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    topicDetails: VideoTopicDetailsSchema.optional(),

    // Tags
    tags: z.array(z.string()).optional(),

    // Status information
    status: VideoStatusSchema.optional(),

    // Live streaming details
    liveStreamingDetails: VideoLiveStreamingDetailsSchema.optional(),

    // Metadata about the metadata
    fetchedAt: z.string(),
    etag: z.string(),
});

/**
 * Video Schema - User provides ONLY type, id, and videoId
 */
export const VideoSchema = z.object({
    type: z.literal("video"),
    id: z.string().min(1, "Video ID is required"),
    videoId: z
        .string()
        .min(1, "YouTube video ID is required")
        .regex(
            /^[a-zA-Z0-9_-]{11}$/,
            "YouTube video ID must be exactly 11 characters (alphanumeric, underscore, or hyphen)"
        ),
    metadata: VideoMetadataSchema,
});

export type VideoInput = z.infer<typeof VideoSchema>;
