import {z} from "zod";

/**
 * Tool Schema - Minimal user input (type, id, toolUrl)
 * All other data is auto-fetched from web scraping
 */

export const ToolMetadataSchema = z.object({
    // Core information
  name: z.string().min(1, "Tool name is required"),
    description: z.string(),
    tagline: z.string().optional(),

    // Tool links
  homepage: z.url("Homepage must be a valid URL").optional(),
  repository: z.url("Repository must be a valid URL").optional(),
  documentation: z.url("Documentation must be a valid URL").optional(),
    downloadUrl: z.string().optional(),

    // Tool details
  license: z.string().optional(),
    platforms: z.array(z.string().min(1)).optional(),
    features: z.array(z.string().min(1)).optional(),
    category: z.string().optional(),
    version: z.string().optional(),
    lastUpdated: z.string().optional(),

    // Pricing
  pricing: z.string().optional(),
    pricingUrl: z.string().optional(),
  isOpenSource: z.boolean().optional(),

    // Additional metadata
    developer: z.string().optional(),
    developerUrl: z.string().optional(),
    image: z.string().optional(),
    language: z.string().optional(),
    topics: z.array(z.string().min(1)).optional(),
    requirements: z.array(z.string().min(1)).optional(),

    // Metadata about the metadata
    fetchedAt: z.string(),
});

/**
 * Tool Schema - User provides ONLY type, id, and toolUrl
 */
export const ToolSchema = z.object({
    type: z.literal("tool"),
    id: z.string().min(1, "Tool ID is required"),
    toolUrl: z.url("Tool URL must be a valid URL"),
    category: z.string().min(1, "Category is required"),
    tags: z.array(z.string().min(1)),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    archived: z.boolean().optional(),
    metadata: ToolMetadataSchema,
});

export type ToolInput = z.infer<typeof ToolSchema>;
