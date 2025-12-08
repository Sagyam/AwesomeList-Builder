import {z} from "zod";
import {ResourceArraySchema} from "@/schema/zod/validation";

/**
 * Project metadata schema
 * Describes the overall awesome list project
 */
export const ProjectMetadataSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(10, "Project description must be at least 10 characters"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g., 1.0.0)"),
  author: z.object({
    name: z.string().min(1, "Author name is required"),
    email: z.email("Author email must be valid").optional(),
    url: z.url("Author URL must be valid").optional(),
  }),
  repository: z.object({
    type: z.enum(["git"]),
    url: z.url("Repository URL must be valid"),
  }),
  homepage: z.url("Homepage URL must be valid").optional(),
  license: z.string().optional(),
  keywords: z.array(z.string().min(1)).min(1, "At least one keyword is required"),
  topics: z.array(z.string().min(1)).optional(),
  social: z
    .object({
      twitter: z.string().optional(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      website: z.url().optional(),
    })
    .optional(),
  created: z.string().datetime({ message: "Created date must be a valid ISO 8601 datetime" }),
  updated: z.string().datetime({ message: "Updated date must be a valid ISO 8601 datetime" }),
});

/**
 * Complete project schema with metadata and resources
 */
export const ProjectSchema = z.object({
  metadata: ProjectMetadataSchema,
  resources: ResourceArraySchema.optional(),
});

export type ProjectMetadataInput = z.infer<typeof ProjectMetadataSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
