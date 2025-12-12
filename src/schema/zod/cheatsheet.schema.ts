import {z} from "zod";

/**
 * Cheatsheet Schema - Minimal user input (type, id, cheatsheetUrl)
 * All other data is auto-fetched from web scraping
 */

export const CheatsheetMetadataSchema = z.object({
  // Core information
  title: z.string().min(1, "Cheatsheet title is required"),
  description: z.string(),
  author: z.string().optional(),
  authorUrl: z.url("Author URL must be a valid URL").optional(),

  // Cheatsheet details
  subject: z.string().min(1, "Subject is required"),
  topics: z.array(z.string().min(1)).optional(),
  published: z.string().optional(),
  updated: z.string().optional(),
  format: z.string().optional(),
  pages: z.number().int().positive("Page count must be a positive integer").optional(),
  downloadUrl: z.url("Download URL must be a valid URL").optional(),
  printable: z.boolean().optional(),
  interactive: z.boolean().optional(),
  version: z.string().optional(),

  // Additional metadata
  image: z.string().optional(),
  language: z.string().optional(),
  license: z.string().optional(),
  fileSize: z.string().optional(),

  // Metadata about the metadata
  fetchedAt: z.string(),
});

/**
 * Cheatsheet Schema - User provides ONLY type, id, and cheatsheetUrl
 */
export const CheatsheetSchema = z.object({
  type: z.literal("cheatsheet"),
  id: z.string().min(1, "Cheatsheet ID is required"),
  cheatsheetUrl: z.url("Cheatsheet URL must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  archived: z.boolean().optional(),
  metadata: CheatsheetMetadataSchema,
});

export type CheatsheetInput = z.infer<typeof CheatsheetSchema>;
