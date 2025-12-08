import { z } from "zod";
import { BaseResourceSchema } from "./base.schema";

export const ConferenceSchema = BaseResourceSchema.extend({
  type: z.literal("conference"),
  name: z.string().min(1, "Conference name is required"),
  organizer: z.string().optional(),
  startDate: z.iso.datetime({ message: "Start date must be a valid ISO 8601 datetime" }),
  endDate: z.iso.datetime({ message: "End date must be a valid ISO 8601 datetime" }),
  location: z.string().optional(),
  venue: z.string().optional(),
  virtual: z.boolean().optional(),
  hybrid: z.boolean().optional(),
  registrationUrl: z.url("Registration URL must be a valid URL").optional(),
  cfpUrl: z.url("Call for Papers URL must be a valid URL").optional(),
  cfpDeadline: z.iso
    .datetime({ message: "CFP deadline must be a valid ISO 8601 datetime" })
    .optional(),
  attendees: z.number().int().positive("Attendee count must be a positive integer").optional(),
  tracks: z
    .array(z.string().min(1), {
      error: "Tracks must be an array of strings",
    })
    .optional(),
  recordings: z.url("Recordings URL must be a valid URL").optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export type ConferenceInput = z.infer<typeof ConferenceSchema>;
