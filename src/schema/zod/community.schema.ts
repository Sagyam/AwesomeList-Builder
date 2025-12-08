import { z } from "zod";
import { BaseResourceSchema } from "./base.schema";

const ActivityLevelSchema = z.enum(["low", "medium", "high", "very-high"], {
  message: "Activity level must be one of: low, medium, high, or very-high.",
});

export const CommunitySchema = BaseResourceSchema.extend({
  type: z.literal("community"),
  name: z.string().min(1, "Community name is required"),
  platform: z.string().min(1, "Platform name is required (e.g., Discord, Slack, Reddit)"),
  members: z.number().int().nonnegative("Member count must be a non-negative integer").optional(),
  moderators: z
    .array(z.string().min(1), {
      error: "Moderators must be an array of strings",
    })
    .optional(),
  created: z.iso.datetime({ message: "Created date must be a valid ISO 8601 datetime" }).optional(),
  activity: ActivityLevelSchema.optional(),
  rulesUrl: z.url("Rules URL must be a valid URL").optional(),
  inviteOnly: z.boolean().optional(),
  verified: z.boolean().optional(),
  languages: z.array(z.string().min(1)).optional(),
});

export type CommunityInput = z.infer<typeof CommunitySchema>;
