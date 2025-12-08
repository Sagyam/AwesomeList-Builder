import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Conference extends BaseResource {
  type: "conference";
  name: string;
  organizer?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  location?: string;
  venue?: string;
  virtual?: boolean;
  hybrid?: boolean;
  registrationUrl?: string;
  cfpUrl?: string; // Call for Papers
  cfpDeadline?: string;
  attendees?: number;
  tracks?: string[];
  recordings?: string;
}
