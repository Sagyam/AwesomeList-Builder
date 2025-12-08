import type { BaseResource } from "./base.interface.ts";
import type { ResourceStatus } from "./types.ts";

export interface Tool extends BaseResource {
  type: "tool";
  name: string;
  homepage?: string;
  repository?: string;
  documentation?: string;
  license?: string;
  platforms?: string[];
  features?: string[];
  pricing?: string;
  isOpenSource?: boolean;
  status?: ResourceStatus;
  version?: string;
  lastUpdated?: string;
}
