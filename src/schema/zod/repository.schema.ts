import { z } from "zod";
import { BaseResourceSchema, MaturitySchema, ResourceStatusSchema } from "./base.schema";

export const RepositorySchema = BaseResourceSchema.extend({
  type: z.literal("repository"),
  name: z.string().min(1, "Repository name is required"),
  owner: z.string().min(1, "Owner name is required"),
  ownerUrl: z.url("Owner URL must be a valid URL").optional(),
  repositoryUrl: z.url("Repository URL must be a valid URL"),
  homepage: z.url("Homepage must be a valid URL").optional(),
  license: z.string().optional(),
  stars: z.number().int().nonnegative("Stars must be a non-negative integer").optional(),
  forks: z.number().int().nonnegative("Forks must be a non-negative integer").optional(),
  watchers: z.number().int().nonnegative("Watchers must be a non-negative integer").optional(),
  openIssues: z.number().int().nonnegative("Open issues must be a non-negative integer").optional(),
  lastCommit: z.iso
    .datetime({ message: "lastCommit must be a valid ISO 8601 datetime" })
    .optional(),
  created: z.iso.datetime({ message: "Created date must be a valid ISO 8601 datetime" }).optional(),
  primaryLanguage: z.string().optional(),
  languages: z.array(z.string().min(1)).optional(),
  status: ResourceStatusSchema.optional(),
  maturity: MaturitySchema.optional(),
  hasWiki: z.boolean().optional(),
  hasDiscussions: z.boolean().optional(),
});

export type RepositoryInput = z.infer<typeof RepositorySchema>;
