import { z } from "zod";

/**
 * Conference Schema - Minimal user input (type, id, conferenceUrl)
 * All other data is auto-fetched from web scraping
 */

export const ConferenceMetadataSchema = z.object({
  // Core information
  name: z.string().min(1, "Conference name is required"),
  description: z.string(),
  organizer: z.string().optional(),
  organizerUrl: z.url("Organizer URL must be a valid URL").optional(),

  // Date and location
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  venue: z.string().optional(),
  virtual: z.boolean().optional(),
  hybrid: z.boolean().optional(),
  timezone: z.string().optional(),

  // Registration and CFP
  registrationUrl: z.url("Registration URL must be a valid URL").optional(),
  registrationDeadline: z.string().optional(),
  cfpUrl: z.url("Call for Papers URL must be a valid URL").optional(),
  cfpDeadline: z.string().optional(),
  registrationFee: z.string().optional(),

  // Conference details
  attendees: z.number().int().positive("Attendee count must be a positive integer").optional(),
  tracks: z.array(z.string().min(1)).optional(),
  speakers: z.array(z.string().min(1)).optional(),
  sponsors: z.array(z.string().min(1)).optional(),
  topics: z.array(z.string().min(1)).optional(),
  recordingsUrl: z.string().optional(),

  // Additional metadata
  image: z.string().optional(),
  language: z.string().optional(),
  format: z.string().optional(),

  // Metadata about the metadata
  fetchedAt: z.string(),
});

/**
 * Conference Schema - User provides ONLY type, id, and conferenceUrl
 */
export const ConferenceSchema = z.object({
  type: z.literal("conference"),
  id: z.string().min(1, "Conference ID is required"),
  conferenceUrl: z.url("Conference URL must be a valid URL"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  archived: z.boolean().optional(),
  metadata: ConferenceMetadataSchema,
});

export type ConferenceInput = z.infer<typeof ConferenceSchema>;
