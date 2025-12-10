import type {BaseResource} from "@/schema/ts/base.interface.ts";
import type {Maturity, ResourceStatus} from "@/schema/ts/types.ts";

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
  openPullRequests?: number;
  lastCommit?: string;
  lastReleaseVersion?: string;
  lastReleaseDate?: string;
  created?: string;
  primaryLanguage?: string;
  languages?: string[];
  status?: ResourceStatus;
  maturity?: Maturity;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
  archived?: boolean;
  topics?: string[];
}
