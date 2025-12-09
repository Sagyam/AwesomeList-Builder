import {
  BookOpen,
  Code,
  FileText,
  GraduationCap,
  Home,
  Library,
  type LucideIcon,
  Mail,
  Mic,
  Mountain,
  Newspaper,
  ScrollText,
  Trophy,
  Video,
  Wrench,
} from "lucide-react";
import type {Types} from "@/schema/ts/types";

/**
 * Maps resource types to their corresponding Lucide icons and display names
 */
export const TYPE_ICON_MAP: Record<
    Types,
    { icon: LucideIcon; label: string }
> = {
    library: {icon: Library, label: "Library"},
    article: {icon: FileText, label: "Article"},
    video: {icon: Video, label: "Video"},
    book: {icon: BookOpen, label: "Book"},
    course: {icon: GraduationCap, label: "Course"},
    tool: {icon: Wrench, label: "Tool"},
    paper: {icon: ScrollText, label: "Paper"},
    podcast: {icon: Mic, label: "Podcast"},
    documentation: {icon: FileText, label: "Documentation"},
    repository: {icon: Code, label: "Repository"},
    community: {icon: Home, label: "Community"},
    newsletter: {icon: Mail, label: "Newsletter"},
    cheatsheet: {icon: Newspaper, label: "Cheat Sheet"},
    conference: {icon: Mountain, label: "Conference"},
    certification: {icon: Trophy, label: "Certification"},
};

/**
 * Get the icon component and label for a given resource type
 */
export function getTypeIcon(type: Types): { icon: LucideIcon; label: string } {
    return TYPE_ICON_MAP[type] || {icon: FileText, label: "Resource"};
}