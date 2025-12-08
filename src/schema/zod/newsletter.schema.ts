import {z} from "zod";
import {BaseResourceSchema} from "@/schema/zod/base.schema";

export const NewsletterSchema = BaseResourceSchema.extend({
  type: z.literal("newsletter"),
  name: z.string().min(1, "Newsletter name is required"),
  author: z.string().optional(),
  authorUrl: z.url("Author URL must be a valid URL").optional(),
  frequency: z.string().min(1, "Frequency is required (e.g., weekly, monthly)"),
  subscribeUrl: z.url("Subscribe URL must be a valid URL").optional(),
  archiveUrl: z.url("Archive URL must be a valid URL").optional(),
  subscribers: z
    .number()
    .int()
    .nonnegative("Subscriber count must be a non-negative integer")
    .optional(),
  firstIssue: z.iso
    .datetime({ message: "First issue date must be a valid ISO 8601 datetime" })
    .optional(),
  platform: z.string().optional(),
  format: z.enum(["email", "web", "both"], {
    message: "Newsletter format must be one of: email, web, or both.",
  }),
  hasRss: z.boolean().optional(),
});

export type NewsletterInput = z.infer<typeof NewsletterSchema>;
