import {z} from "zod";

/**
 * Certification Schema - Minimal user input (type, id, certificationUrl)
 * All other data is auto-fetched from web scraping
 */

export const CertificationMetadataSchema = z.object({
  // Core information
  title: z.string().min(1, "Certification title is required"),
  description: z.string(),
  provider: z.string().min(1, "Provider name is required"),
  providerUrl: z.url("Provider URL must be a valid URL").optional(),

  // Certification details
  examCode: z.string().optional(),
  duration: z.string().optional(),
  examDuration: z.string().optional(),
  cost: z.string().optional(),
  prerequisites: z.array(z.string().min(1)).optional(),
  format: z.string().optional(),
  passingScore: z
    .number()
    .min(0, "Passing score must be between 0 and 100")
    .max(100, "Passing score must be between 0 and 100")
    .optional(),
  renewalRequired: z.boolean().optional(),

  // Additional metadata
  recognizedBy: z.array(z.string().min(1)).optional(),
  image: z.string().optional(),
  language: z.string().optional(),
  difficultyLevel: z.string().optional(),
  topics: z.array(z.string().min(1)).optional(),

  // Metadata about the metadata
  fetchedAt: z.string(),
  lastUpdated: z.string().optional(),
});

/**
 * Certification Schema - User provides ONLY type, id, and certificationUrl
 */
export const CertificationSchema = z.object({
  type: z.literal("certification"),
  id: z.string().min(1, "Certification ID is required"),
  certificationUrl: z.url("Certification URL must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  archived: z.boolean().optional(),
  metadata: CertificationMetadataSchema,
});

export type CertificationInput = z.infer<typeof CertificationSchema>;
