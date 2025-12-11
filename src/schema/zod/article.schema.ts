import {z} from "zod";
import {BaseResourceSchemaObject} from "@/schema/zod/base.schema";

export const ArticleMetadataSchema = z.object({
  title: z.string().min(1, "Article title is required"),
  description: z.string(),
  link: z.string().url(),
  image: z.string().url().optional(),
  author: z.string().optional(),
  authorUrl: z.string().url().optional(),
  published: z.string().optional(),
  updated: z.string().optional(),
  readTime: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const ArticleSchema = BaseResourceSchemaObject.omit({
  title: true,
  description: true,
  name: true,
}).extend({
  type: z.literal("article"),
  url: z.string().url("Article URL must be a valid URL"),
  rssUrl: z.string().url("RSS URL must be a valid URL").optional(),
  platform: z.string().optional(),
  format: z.string().optional(),
  paywall: z.boolean().optional(),
  metadata: ArticleMetadataSchema,
});

export type ArticleInput = z.infer<typeof ArticleSchema>;
