import {z} from "zod";

/**
 * Documentation Schema - Minimal user input (type, id, documentationUrl)
 * All other data is auto-fetched from web scraping
 */

export const DocumentationMetadataSchema = z.object({
    // Core information
  title: z.string().min(1, "Documentation title is required"),
    description: z.string(),
  project: z.string().optional(),
    projectUrl: z.url("Project URL must be a valid URL").optional(),

    // Documentation details
    version: z.string().optional(),
    versions: z.array(z.string().min(1)).optional(),
  repository: z.url("Repository must be a valid URL").optional(),
  format: z.string().optional(),
    sections: z.array(z.string().min(1)).optional(),
  searchable: z.boolean().optional(),
  interactive: z.boolean().optional(),
    lastUpdated: z.string().optional(),

    // Additional metadata
  officialDocs: z.boolean().optional(),
    maintainer: z.string().optional(),
    license: z.string().optional(),
    image: z.string().optional(),
    language: z.string().optional(),
    languages: z.array(z.string().min(1)).optional(),
    topics: z.array(z.string().min(1)).optional(),

    // Metadata about the metadata
    fetchedAt: z.string(),
});

/**
 * Documentation Schema - User provides ONLY type, id, and documentationUrl
 */
export const DocumentationSchema = z.object({
    type: z.literal("documentation"),
    id: z.string().min(1, "Documentation ID is required"),
    documentationUrl: z.url("Documentation URL must be a valid URL"),
    category: z.string().min(1, "Category is required"),
    tags: z.array(z.string().min(1)),
    featured: z.boolean().optional(),
    trending: z.boolean().optional(),
    archived: z.boolean().optional(),
    metadata: DocumentationMetadataSchema,
});

export type DocumentationInput = z.infer<typeof DocumentationSchema>;
