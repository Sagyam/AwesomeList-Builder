import type {Resource} from "@/schema/ts/types";

/**
 * Search configuration options
 */
export interface SearchConfig {
  enableHighlighting: boolean;
  enablePersistence: boolean;
  enableEmbeddings: boolean;
}

/**
 * Project metadata interface
 * Describes the overall awesome list project
 */
export interface ProjectMetadata {
  name: string;
  title: string;
  description: string;
  version: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  repository: {
    type: "git";
    url: string;
  };
  homepage?: string;
  license?: string;
  keywords: string[];
  topics?: string[];
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  created: string;
  updated: string;
  search?: SearchConfig;
}

/**
 * Complete project interface with metadata and resources
 */
export interface Project {
  metadata: ProjectMetadata;
  resources?: Resource[];
}
