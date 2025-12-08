import type { BaseResource } from "@/schema/ts/";

export interface Course extends BaseResource {
  type: "course";
  title: string;
  platform: string;
  instructor: string;
  instructorUrl?: string;
  published: string;
  updated?: string;
  duration?: string;
  lessons?: number;
  hasSubtitles?: boolean;
  price?: string;
  discountPrice?: string;
  rating?: number;
  students?: number;
  certificate?: boolean;
  prerequisites?: string[];
}
