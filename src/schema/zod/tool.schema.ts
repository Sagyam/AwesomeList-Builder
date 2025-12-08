import { z } from "zod";
import { BaseResourceSchema, ResourceStatusSchema } from "./base.schema";

export const ToolSchema = BaseResourceSchema.extend({
  type: z.literal("tool"),
  name: z.string().min(1, "Tool name is required"),
  homepage: z.url("Homepage must be a valid URL").optional(),
  repository: z.url("Repository must be a valid URL").optional(),
  documentation: z.url("Documentation must be a valid URL").optional(),
  license: z.string().optional(),
  platforms: z
    .array(z.string().min(1), {
      error: "Platforms must be an array of strings",
    })
    .optional(),
  features: z
    .array(z.string().min(1), {
      error: "Features must be an array of strings",
    })
    .optional(),
  pricing: z.string().optional(),
  isOpenSource: z.boolean().optional(),
  status: ResourceStatusSchema.optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?/, "Version must follow semantic versioning (e.g., 1.0.0)")
    .optional(),
  lastUpdated: z.iso
    .datetime({ message: "lastUpdated must be a valid ISO 8601 datetime" })
    .optional(),
});

export type ToolInput = z.infer<typeof ToolSchema>;
