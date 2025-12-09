import {loadProjectData} from "@/lib/parsers/project-parser";
import type {Project, ProjectMetadata} from "@/schema/ts/project.interface";
import type {Resource} from "@/schema/ts/types";

/**
 * Get complete project data (metadata + resources)
 */
export function getProject(): Project {
  return loadProjectData();
}

/**
 * Get project metadata only
 */
export function getProjectMetadata(): ProjectMetadata {
  const project = loadProjectData();
  return project.metadata;
}

/**
 * Get all resources
 */
export function getAllResources(): Resource[] {
  const project = loadProjectData();
  return project.resources || [];
}

/**
 * Get featured resources
 */
export function getFeaturedResources(): Resource[] {
  const resources = getAllResources();
  return resources.filter((resource) => resource.featured === true);
}

/**
 * Get trending resources
 */
export function getTrendingResources(): Resource[] {
  const resources = getAllResources();
  return resources.filter((resource) => resource.trending === true);
}

/**
 * Get resource by ID
 */
export function getResourceById(id: string): Resource | undefined {
  const resources = getAllResources();
  return resources.find((resource) => resource.id === id);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const resources = getAllResources();
  const categories = new Set(resources.map((r) => r.category));
  return Array.from(categories).sort();
}

/**
 * Get resources by category
 */
export function getResourcesByCategory(category: string): Resource[] {
  const resources = getAllResources();
  return resources.filter((resource) => resource.category === category);
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const resources = getAllResources();
  const tags = new Set(resources.flatMap((r) => r.tags || []));
  return Array.from(tags).sort();
}

/**
 * Get resources by tag
 */
export function getResourcesByTag(tag: string): Resource[] {
  const resources = getAllResources();
  return resources.filter((resource) => resource.tags?.includes(tag));
}

/**
 * Get a resource display name (handles both name and title fields)
 */
export function getResourceName(resource: Resource): string {
  return resource.name || resource.title || "Untitled";
}

/**
 * Get category stats
 */
export function getCategoryStats(): Record<string, number> {
  const resources = getAllResources();
  const stats: Record<string, number> = {};

  for (const resource of resources) {
    const category = resource.category;
    stats[category] = (stats[category] || 0) + 1;
  }

  return stats;
}

/**
 * Get total stars across all resources
 */
export function getTotalStars(): number {
  const resources = getAllResources();
  return resources.reduce((sum, resource) => {
    // Check for stars in different possible locations
    if ("stars" in resource && typeof resource.stars === "number") {
      return sum + resource.stars;
    }
    return sum;
  }, 0);
}

/**
 * Generate SEO metadata from project metadata
 */
export function getSEOMetadata() {
  const metadata = getProjectMetadata();
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    author: metadata.author.name,
    ogImage: "/og-image.png", // Can be extended to pull from metadata if added
  };
}
