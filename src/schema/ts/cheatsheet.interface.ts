import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Cheatsheet extends BaseResource {
  type: "cheatsheet";
  title: string;
  author?: string;
  authorUrl?: string;
  subject: string;
  published?: string;
  updated?: string;
  format: string; // PDF, HTML, Image, Interactive, etc.
  pages?: number;
  downloadUrl?: string;
  printable?: boolean;
  interactive?: boolean;
  version?: string;
}
