import {z} from "zod";
import {BaseResourceSchema} from "@/schema/zod/base.schema";

export const PodcastSchema = BaseResourceSchema.extend({
  type: z.literal("podcast"),
  title: z.string().min(1, "Podcast episode title is required"),
  host: z.string().min(1, "Host name is required"),
  hostUrl: z.url("Host URL must be a valid URL").optional(),
  platform: z.string().optional(),
  rssFeed: z.url("RSS feed must be a valid URL").optional(),
  episodeNumber: z.number().int().positive("Episode number must be a positive integer").optional(),
  season: z.number().int().positive("Season number must be a positive integer").optional(),
  published: z.iso.datetime({ message: "Published date must be a valid ISO 8601 datetime" }),
  duration: z
    .string()
    .regex(
      /^PT(\d+H)?(\d+M)?(\d+S)?$/,
      "Duration must be in ISO 8601 format (e.g., PT1H30M for 1 hour 30 minutes)"
    )
    .optional(),
  thumbnail: z.url("Thumbnail must be a valid URL").optional(),
  explicit: z.boolean().optional(),
  transcript: z.url("Transcript must be a valid URL").optional(),
});

export type PodcastInput = z.infer<typeof PodcastSchema>;
