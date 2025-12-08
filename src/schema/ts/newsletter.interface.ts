import type { BaseResource } from "./base.interface.ts";

export interface Newsletter extends BaseResource {
  type: "newsletter";
  name: string;
  author?: string;
  authorUrl?: string;
  frequency: string; // "weekly", "biweekly", "monthly", etc.
  subscribeUrl?: string;
  archiveUrl?: string;
  subscribers?: number;
  firstIssue?: string;
  platform?: string; // Substack, Mailchimp, etc.
  format?: "email" | "web" | "both";
  hasRss?: boolean;
}
