import { z } from "zod";
import { ArticleSchema } from "@/schema/zod/article.schema.ts";
import { BookSchema } from "@/schema/zod/book.schema.ts";
import { CertificationSchema } from "@/schema/zod/certification.schema.ts";
import { CheatsheetSchema } from "@/schema/zod/cheatsheet.schema.ts";
import { CommunitySchema } from "@/schema/zod/community.schema.ts";
import { ConferenceSchema } from "@/schema/zod/conference.schema.ts";
import { CourseSchema } from "@/schema/zod/course.schema.ts";
import { DocumentationSchema } from "@/schema/zod/documentation.schema.ts";
import { LibrarySchema } from "@/schema/zod/library.schema.ts";
import { NewsletterSchema } from "@/schema/zod/newsletter.schema.ts";
import { PaperSchema } from "@/schema/zod/paper.schema.ts";
import { PodcastSchema } from "@/schema/zod/podcast.schema.ts";
import { RepositorySchema } from "@/schema/zod/repository.schema.ts";
import { ToolSchema } from "@/schema/zod/tool.schema.ts";
import { VideoSchema } from "@/schema/zod/video.schema.ts";

/**
 * Discriminated union of all resource schemas
 * Validates resources based on their 'type' field
 */
export const ResourceSchema = z.discriminatedUnion("type", [
  LibrarySchema,
  ArticleSchema,
  VideoSchema,
  BookSchema,
  CourseSchema,
  ToolSchema,
  PaperSchema,
  PodcastSchema,
  DocumentationSchema,
  RepositorySchema,
  CommunitySchema,
  NewsletterSchema,
  CheatsheetSchema,
  ConferenceSchema,
  CertificationSchema,
]);

/**
 * Schema for validating an array of resources
 */
export const ResourceArraySchema = z.array(ResourceSchema, {
  error: "Resources must be an array and is required",
});

/**
 * Validation helper function for single resources
 * Returns parsed data or throws detailed validation errors
 */
export function validateResource(data: unknown) {
  return ResourceSchema.parse(data);
}

/**
 * Safe validation helper that returns a success/error result
 */
export function validateResourceSafe(data: unknown) {
  return ResourceSchema.safeParse(data);
}

/**
 * Validation helper for resource arrays
 */
export function validateResourceArray(data: unknown) {
  return ResourceArraySchema.parse(data);
}

/**
 * Safe validation for resource arrays
 */
export function validateResourceArraySafe(data: unknown) {
  return ResourceArraySchema.safeParse(data);
}

// Infer the Resource type from the schema
export type ResourceInput = z.infer<typeof ResourceSchema>;
export type ResourceArrayInput = z.infer<typeof ResourceArraySchema>;
