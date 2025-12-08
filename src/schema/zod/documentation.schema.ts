import {z} from "zod";
import {BaseResourceSchema, ResourceStatusSchema} from "@/schema/zod/base.schema";

export const DocumentationSchema = BaseResourceSchema.extend({
  type: z.literal("documentation"),
  title: z.string().min(1, "Documentation title is required"),
  project: z.string().optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?/, "Version must follow semantic versioning (e.g., 1.0.0)")
    .optional(),
  homepage: z.url("Homepage must be a valid URL").optional(),
  repository: z.url("Repository must be a valid URL").optional(),
  format: z.string().optional(),
  sections: z
    .array(z.string().min(1), {
      error: "Sections must be an array of strings",
    })
    .optional(),
  searchable: z.boolean().optional(),
  interactive: z.boolean().optional(),
  lastUpdated: z.iso
    .datetime({ message: "lastUpdated must be a valid ISO 8601 datetime" })
    .optional(),
  status: ResourceStatusSchema.optional(),
  officialDocs: z.boolean().optional(),
});

export type DocumentationInput = z.infer<typeof DocumentationSchema>;
