import { z } from "zod";
import { BaseResourceSchemaObject } from "@/schema/zod/base.schema";

export const VideoSchema = BaseResourceSchemaObject.extend({
  type: z.literal("video"),
  title: z.string().min(1, "Video title is required"),
  platform: z.string().min(1, "Platform name is required (e.g., YouTube, Vimeo)"),
  creator: z.string().min(1, "Creator name is required"),
  creatorUrl: z.url("Creator URL must be a valid URL").optional(),
  channel: z.string().optional(),
  thumbnail: z.url("Thumbnail must be a valid URL").optional(),
  published: z.iso.datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  duration: z
    .string()
    .regex(
      /^PT(\d+H)?(\d+M)?(\d+S)?$/,
      "Duration must be in ISO 8601 format (e.g., PT1H30M for 1 hour 30 minutes)"
    ),
  hasSubtitles: z.boolean().optional(),
  views: z.number().int().nonnegative("Views must be a non-negative integer").optional(),
  quality: z.string().optional(),
});

export type VideoInput = z.infer<typeof VideoSchema>;
