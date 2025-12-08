import type { BaseResource } from "@/schema/ts/base.interface.ts";
import type { ResourceStatus } from "@/schema/ts/types.ts";

export interface Documentation extends BaseResource {
  type: "documentation";
  title: string;
  project?: string;
  version?: string;
  homepage?: string;
  repository?: string;
  format?: string; // HTML, PDF, Markdown, etc.
  sections?: string[];
  searchable?: boolean;
  interactive?: boolean;
  lastUpdated?: string;
  status?: ResourceStatus;
  officialDocs?: boolean;
}
