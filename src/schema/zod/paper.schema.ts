import {z} from "zod";
import {BaseResourceSchemaObject} from "@/schema/zod/base.schema";

export const PaperSchema = BaseResourceSchemaObject.extend({
  type: z.literal("paper"),
  title: z.string().min(1, "Paper title is required"),
  authors: z
    .array(z.string().min(1), {
      error: "At least one author is required and authors must be an array of strings",
    })
    .min(1, "At least one author is required"),
  published: z.iso.datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  venue: z.string().optional(),
  doi: z
    .string()
    .regex(/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/, "DOI must be valid (e.g., 10.1000/xyz123)")
    .optional(),
  arxivId: z
    .string()
    .regex(/^\d{4}\.\d{4,5}(v\d+)?$/, "arXiv ID must be valid (e.g., 2103.12345 or 2103.12345v1)")
    .optional(),
  pdfUrl: z.url("PDF URL must be a valid URL").optional(),
  abstract: z.string().min(50, "Abstract should be at least 50 characters").optional(),
  citations: z.number().int().nonnegative("Citations must be a non-negative integer").optional(),
  field: z.string().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

export type PaperInput = z.infer<typeof PaperSchema>;
