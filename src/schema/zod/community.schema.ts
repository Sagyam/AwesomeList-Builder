import {z} from "zod";

/**
 * Community Schema - Minimal user input (type, id, communityUrl)
 * All other data is auto-fetched from web scraping
 */

const ActivityLevelSchema = z.enum(["low", "medium", "high", "very-high"], {
  message: "Activity level must be one of: low, medium, high, or very-high.",
});

export const CommunityMetadataSchema = z.object({
    // Core information
  name: z.string().min(1, "Community name is required"),
    description: z.string(),
  platform: z.string().min(1, "Platform name is required (e.g., Discord, Slack, Reddit)"),

    // Community details
  members: z.number().int().nonnegative("Member count must be a non-negative integer").optional(),
    onlineMembers: z.number().int().nonnegative().optional(),
    moderators: z.array(z.string().min(1)).optional(),
    created: z.string().optional(),
  activity: ActivityLevelSchema.optional(),

    // Access and rules
  rulesUrl: z.url("Rules URL must be a valid URL").optional(),
  inviteOnly: z.boolean().optional(),
  verified: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),

    // Additional metadata
  languages: z.array(z.string().min(1)).optional(),
    topics: z.array(z.string().min(1)).optional(),
    image: z.string().optional(),
    categories: z.array(z.string().min(1)).optional(),

    // Metadata about the metadata
    fetchedAt: z.string(),
});

/**
 * Community Schema - User provides ONLY type, id, and communityUrl
 */
export const CommunitySchema = z.object({
    type: z.literal("community"),
    id: z.string().min(1, "Community ID is required"),
    communityUrl: z.url("Community URL must be a valid URL"),
    category: z.string().min(1, "Category is required"),
    tags: z.array(z.string().min(1)),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    archived: z.boolean().optional(),
    metadata: CommunityMetadataSchema,
});

export type CommunityInput = z.infer<typeof CommunitySchema>;
