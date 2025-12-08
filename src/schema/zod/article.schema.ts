import { z } from "zod";
import { BaseResourceSchemaObject } from "@/schema/zod/base.schema";

export const ArticleSchema = BaseResourceSchemaObject.extend({
  type: z.literal("article"),
  title: z.string().min(1, "Article title is required"),
  author: z.string().min(1, "Author name is required"),
  authorUrl: z.url("Author URL must be a valid URL").optional(),
  published: z.iso.datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  updated: z.iso.datetime({ message: "Updated date must be a valid ISO 8601 datetime" }).optional(),
  readTime: z
    .string()
    .regex(
      /^\d+\s*(min|mins|minutes?)$/,
      "Read time must be in format like '5 min' or '10 minutes'"
    )
    .optional(),
  format: z.string().optional(),
  isPaid: z.boolean().optional(),
  paywall: z.boolean().optional(),
});

export type ArticleInput = z.infer<typeof ArticleSchema>;
