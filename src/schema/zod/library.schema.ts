import {z} from "zod";
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
  forks: z.number().int().nonnegative("Forks must be a non-negative integer").optional(),
  watchers: z.number().int().nonnegative("Watchers must be a non-negative integer").optional(),
  openIssues: z.number().int().nonnegative("Open issues must be a non-negative integer").optional(),
  openPullRequests: z
    .number()
    .int()
    .nonnegative("Open pull requests must be a non-negative integer")
    .optional(),
  lastCommit: z.iso
    .datetime({ message: "lastCommit must be a valid ISO 8601 datetime" })
    .optional(),
  lastReleaseVersion: z.string().optional(),
  lastReleaseDate: z.iso
    .datetime({ message: "lastReleaseDate must be a valid ISO 8601 datetime" })
    .optional(),
  created: z.iso.datetime({ message: "Created date must be a valid ISO 8601 datetime" }).optional(),
  downloads: z.string().optional(),
  status: ResourceStatusSchema.optional(),
  maturity: MaturitySchema.optional(),
  languages: z.array(z.string().min(1)).optional(),
  platforms: z.array(z.string().min(1)).optional(),
  archived: z.boolean().optional(),
  topics: z.array(z.string().min(1)).optional(),
  hasWiki: z.boolean().optional(),
  hasDiscussions: z.boolean().optional(),
});

export type LibraryInput = z.infer<typeof LibrarySchema>;
