import { z } from "zod";
import { BaseResourceSchemaObject } from "@/schema/zod/base.schema";

export const CheatsheetSchema = BaseResourceSchemaObject.extend({
  type: z.literal("cheatsheet"),
  title: z.string().min(1, "Cheatsheet title is required"),
  author: z.string().optional(),
  authorUrl: z.url("Author URL must be a valid URL").optional(),
  subject: z.string().min(1, "Subject is required"),
  published: z.iso
    .datetime({ message: "Published date must be a valid ISO 8601 datetime" })
    .optional(),
  updated: z.iso.datetime({ message: "Updated date must be a valid ISO 8601 datetime" }).optional(),
  format: z.string().min(1, "Format is required (e.g., PDF, HTML, Image)"),
  pages: z.number().int().positive("Page count must be a positive integer").optional(),
  downloadUrl: z.url("Download URL must be a valid URL").optional(),
  printable: z.boolean().optional(),
  interactive: z.boolean().optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?/, "Version must follow semantic versioning (e.g., 1.0.0)")
    .optional(),
});

export type CheatsheetInput = z.infer<typeof CheatsheetSchema>;
