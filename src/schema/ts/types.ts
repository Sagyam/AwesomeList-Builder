import type { Article } from "@/schema/ts/article.interface.ts";
import type { Book } from "@/schema/ts/book.interface.ts";
import type { Certification } from "@/schema/ts/certification.interface.ts";
import type { Cheatsheet } from "@/schema/ts/cheatsheet.interface.ts";
import type { Community } from "@/schema/ts/community.interface.ts";
import type { Conference } from "@/schema/ts/conference.interface.ts";
import type { Course } from "@/schema/ts/course.interface.ts";
import type { Documentation } from "@/schema/ts/documentation.interface.ts";
import type { Library } from "@/schema/ts/library.interface.ts";
import type { Newsletter } from "@/schema/ts/newsletter.interface.ts";
import type { Paper } from "@/schema/ts/paper.interface.ts";
import type { Podcast } from "@/schema/ts/podcast.interface.ts";
import type { Repository } from "@/schema/ts/repository.interface.ts";
import type { Tool } from "@/schema/ts/tool.interface.ts";
import type { Video } from "@/schema/ts/video.interface.ts";

export type Types =
  | "library"
  | "article"
  | "video"
  | "book"
  | "course"
  | "tool"
  | "paper"
  | "podcast"
  | "documentation"
  | "repository"
  | "community"
  | "newsletter"
  | "cheatsheet"
  | "conference"
  | "certification";

export type Resource =
  | Library
  | Article
  | Video
  | Book
  | Course
  | Tool
  | Paper
  | Podcast
  | Documentation
  | Repository
  | Community
  | Newsletter
  | Cheatsheet
  | Conference
  | Certification;

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type AccessLevel = "free" | "freemium" | "paid" | "enterprise";
export type ResourceStatus = "active" | "maintenance" | "deprecated" | "archived";
export type Maturity = "experimental" | "beta" | "stable" | "mature";
export type Registry =
  | "npm"
  | "pypi"
  | "cargo"
  | "rubygems"
  | "maven"
  | "nuget"
  | "go"
  | "packagist";
