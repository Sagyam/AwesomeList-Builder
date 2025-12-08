import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Paper extends BaseResource {
  type: "paper";
  title: string;
  authors: string[];
  published: string;
  venue?: string; // Conference or Journal name
  doi?: string;
  arxivId?: string;
  pdfUrl?: string;
  abstract?: string;
  citations?: number;
  field?: string; // e.g., "Computer Science", "Machine Learning"
  keywords?: string[];
}
