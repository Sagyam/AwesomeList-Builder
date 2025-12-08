import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Community extends BaseResource {
  type: "community";
  name: string;
  platform: string; // Discord, Slack, Reddit, Forum, etc.
  members?: number;
  moderators?: string[];
  created?: string;
  activity?: "low" | "medium" | "high" | "very-high";
  rulesUrl?: string;
  inviteOnly?: boolean;
  verified?: boolean;
  languages?: string[];
}
