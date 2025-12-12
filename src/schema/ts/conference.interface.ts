/**
 * Conference Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, conferenceUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from conference page
 */

export interface ConferenceMetadata {
    // Core information
  name: string;
    description: string;
  organizer?: string;
    organizerUrl?: string;

    // Date and location
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
  location?: string;
  venue?: string;
  virtual?: boolean;
  hybrid?: boolean;
    timezone?: string;

    // Registration and CFP
  registrationUrl?: string;
    registrationDeadline?: string;
  cfpUrl?: string; // Call for Papers
  cfpDeadline?: string;
    registrationFee?: string;

    // Conference details
  attendees?: number;
  tracks?: string[];
    speakers?: string[];
    sponsors?: string[];
    topics?: string[];
    recordingsUrl?: string;

    // Additional metadata
    image?: string; // Conference logo or banner
    language?: string;
    format?: string; // In-person, Virtual, Hybrid

    // Metadata about the metadata
    fetchedAt: string; // ISO timestamp
}

/**
 * Conference Resource
 * User provides ONLY: type, id, conferenceUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Conference {
    type: "conference";
    id: string;
    conferenceUrl: string; // User provided URL to conference page

    // Required base fields
    category: string;
    tags: string[];

    // Optional user-provided subjective flags
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;

    // Everything else is auto-fetched
    metadata: ConferenceMetadata;
}
