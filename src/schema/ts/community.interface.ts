/**
 * Community Resource Schema
 *
 * Two-tiered system:
 * Tier 1 (User Input): type, id, communityUrl, featured, trending
 * Tier 2 (Auto-fetched): All metadata scraped from community page
 */

export interface CommunityMetadata {
    // Core information
  name: string;
    description: string;
  platform: string; // Discord, Slack, Reddit, Forum, etc.

    // Community details
  members?: number;
    onlineMembers?: number;
  moderators?: string[];
  created?: string;
  activity?: "low" | "medium" | "high" | "very-high";

    // Access and rules
  rulesUrl?: string;
  inviteOnly?: boolean;
  verified?: boolean;
    requiresApproval?: boolean;

    // Additional metadata
  languages?: string[];
    topics?: string[];
    image?: string; // Community logo or icon
    categories?: string[];

    // Metadata about the metadata
    fetchedAt: string; // ISO timestamp
}

/**
 * Community Resource
 * User provides ONLY: type, id, communityUrl
 * Optional user flags: featured, trending
 * All other fields are auto-generated from web scraping
 */
export interface Community {
    type: "community";
    id: string;
    communityUrl: string; // User provided URL to community page

    // Required base fields
    category: string;
    tags: string[];

    // Optional user-provided subjective flags
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;

    // Everything else is auto-fetched
    metadata: CommunityMetadata;
}
