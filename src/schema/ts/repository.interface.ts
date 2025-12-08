import type { BaseResource } from "@/schema/ts/base.interface.ts";
import type { Maturity, ResourceStatus } from "@/schema/ts/types.ts";

export interface Repository extends BaseResource {
  type: "repository";
  name: string;
  owner: string;
  ownerUrl?: string;
  repositoryUrl: string;
  homepage?: string;
  license?: string;
  stars?: number;
  forks?: number;
  watchers?: number;
  openIssues?: number;
  lastCommit?: string;
  created?: string;
  primaryLanguage?: string;
  languages?: string[];
  status?: ResourceStatus;
  maturity?: Maturity;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
}
