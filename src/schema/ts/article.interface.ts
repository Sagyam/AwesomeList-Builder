import type { BaseResource } from "@/schema/ts/base.interface.ts";

export interface Article extends BaseResource {
  type: "article";
  title: string;
  author: string;
  authorUrl?: string;
  published: string;
  updated?: string;
  readTime?: string;
  format?: string;
  isPaid?: boolean;
  paywall?: boolean;
}
