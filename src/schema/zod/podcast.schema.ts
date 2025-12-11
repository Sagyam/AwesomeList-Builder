import { z } from "zod";
import { BaseResourceSchemaObject } from "@/schema/zod/base.schema";

export const PodcastEpisodeSchema = z.object({
  title: z.string(),
  published: z.string(),
  duration: z.string().optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
});

export const PodcastMetadataSchema = z.object({
  title: z.string().min(1, "Podcast title is required"),
  description: z.string(),
  link: z.string().url().optional(),
  image: z.string().url().optional(),
  author: z.string().optional(),
  copyright: z.string().optional(),
  language: z.string().optional(),
  lastBuildDate: z.string().optional(),
  itunesId: z.string().optional(),
  episodes: z.array(PodcastEpisodeSchema),
});

export const PodcastSchema = BaseResourceSchemaObject.omit({
  title: true,
  description: true,
  url: true,
  image: true,
}).extend({
  type: z.literal("podcast"),
  rssFeed: z.string().url("RSS feed must be a valid URL"),
  platform: z.string().optional(),
  hostUrl: z.string().url().optional(),
  metadata: PodcastMetadataSchema,
});

export type PodcastInput = z.infer<typeof PodcastSchema>;
