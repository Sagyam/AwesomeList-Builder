import type {BaseResource} from "@/schema/ts/base.interface.ts";
import type {Maturity, Registry, ResourceStatus} from "@/schema/ts/types.ts";

export interface Library extends BaseResource {
  type: "library";
  name: string;
  package: {
    registry: Registry;
    name: string;
  };
  repository?: string;
  documentation?: string;
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
  downloads?: string;
  status?: ResourceStatus;
  maturity?: Maturity;
  languages?: string[];
  platforms?: string[];
  archived?: boolean;
  topics?: string[];
  hasWiki?: boolean;
  hasDiscussions?: boolean;
}
