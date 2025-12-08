import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Book extends BaseResource {
  type: "book";
  title: string;
  author: string;
  authorUrl?: string;
  isbn?: string;
  isbn13?: string;
  published: string;
  publisher?: string;
  edition?: string;
  pages?: number;
  formats?: string[];
  price?: string;
  rating?: number;
}
