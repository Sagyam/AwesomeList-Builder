import { z } from "zod";
import {
  BaseResourceSchemaObject,
  MaturitySchema,
  RegistrySchema,
  ResourceStatusSchema,
} from "@/schema/zod/base.schema";

export const LibrarySchema = BaseResourceSchemaObject.extend({
  type: z.literal("library"),
  name: z.string().min(1, "Library name is required"),
  package: z.object(
    {
      registry: RegistrySchema,
      name: z.string().min(1, "Package name is required"),
    },
    {
      error: "Package information is required for libraries",
    }
  ),
  repository: z.url("Repository must be a valid URL").optional(),
  documentation: z.url("Documentation must be a valid URL").optional(),
  homepage: z.url("Homepage must be a valid URL").optional(),
  license: z.string().optional(),
  stars: z.number().int().nonnegative("Stars must be a non-negative integer").optional(),
  downloads: z.string().optional(),
  lastUpdated: z.iso
    .datetime({ message: "lastUpdated must be a valid ISO 8601 datetime" })
    .optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?/, "Version must follow semantic versioning (e.g., 1.0.0)")
    .optional(),
  status: ResourceStatusSchema.optional(),
  maturity: MaturitySchema.optional(),
  languages: z.array(z.string().min(1)).optional(),
  platforms: z.array(z.string().min(1)).optional(),
});

export type LibraryInput = z.infer<typeof LibrarySchema>;
