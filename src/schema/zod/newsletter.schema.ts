import {z} from "zod";
import {BaseResourceSchemaObject} from "@/schema/zod/base.schema";

export const NewsletterMetadataSchema = z.object({
    title: z.string().min(1, "Newsletter title is required"),
    description: z.string(),
    link: z.string().url(),
    image: z.string().url().optional(),
  author: z.string().optional(),
    authorUrl: z.string().url().optional(),
    language: z.string().optional(),
    copyright: z.string().optional(),
    lastBuildDate: z.string().optional(),
    subscribers: z.number().int().nonnegative().optional(),
    frequency: z.string().optional(),
    firstIssue: z.string().optional(),
    latestIssue: z
        .object({
            title: z.string(),
            published: z.string(),
            url: z.string().url().optional(),
        })
    .optional(),
});

export const NewsletterSchema = BaseResourceSchemaObject.omit({
    title: true,
    description: true,
    name: true,
    url: true,
}).extend({
    type: z.literal("newsletter"),
    rssUrl: z.string().url("RSS URL must be a valid URL"),
  platform: z.string().optional(),
    format: z.enum(["email", "web", "both"]).optional(),
    subscribeUrl: z.string().url("Subscribe URL must be a valid URL").optional(),
    archiveUrl: z.string().url("Archive URL must be a valid URL").optional(),
    image: z.string().url("Image URL must be a valid URL").optional(),
    imageAlt: z.string().optional(),
    metadata: NewsletterMetadataSchema,
});

export type NewsletterInput = z.infer<typeof NewsletterSchema>;
