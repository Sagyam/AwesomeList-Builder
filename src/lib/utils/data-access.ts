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
  if (resource.type === "podcast") {
    return resource.metadata.title;
  }
  if (resource.type === "book") {
    return resource.metadata.title;
  }
  if (resource.type === "article") {
    return resource.metadata.title;
  }
  if (resource.type === "newsletter") {
    return resource.metadata.title;
  }
  if (resource.type === "video") {
    return resource.metadata.title;
  }
  return (resource as any).name || (resource as any).title || "Untitled";
}

/**
 * Get resource description
 */
export function getResourceDescription(resource: Resource): string {
  if (resource.type === "podcast") {
    return resource.metadata.description;
  }
  if (resource.type === "book") {
    return resource.metadata.description || "";
  }
  if (resource.type === "article") {
    return resource.metadata.description;
  }
  if (resource.type === "newsletter") {
    return resource.metadata.description;
  }
  if (resource.type === "video") {
    return resource.metadata.description;
  }
  return (resource as any).description || "";
}

/**
 * Get resource URL
 */
export function getResourceUrl(resource: Resource): string {
  if (resource.type === "podcast") {
    return resource.metadata.link;
  }
  if (resource.type === "book") {
    // Return the first link if available, otherwise construct an Open Library URL
    if (resource.metadata.links && resource.metadata.links.length > 0) {
      return resource.metadata.links[0].url;
    }
    // Fallback to Open Library ISBN page
    return `https://openlibrary.org/isbn/${resource.isbn}`;
  }
  if (resource.type === "article") {
    return resource.metadata.link;
  }
  if (resource.type === "newsletter") {
    // Prefer subscribeUrl if available, otherwise use metadata link
    return resource.subscribeUrl || resource.metadata.link;
  }
  if (resource.type === "video") {
    // Construct YouTube URL from video ID
    return `https://www.youtube.com/watch?v=${resource.videoId}`;
  }
  return (resource as any).url || "";
}

/**
 * Get resource image
 */
export function getResourceImage(resource: Resource): string | undefined {
  if (resource.type === "podcast") {
    return resource.metadata.image;
  }
  if (resource.type === "book") {
    // Prefer Google Books images, fallback to Open Library
    const images = resource.metadata.images;
    return (
      images.large ||
      images.medium ||
      images.thumbnail ||
      images.small ||
      images.extraLarge ||
      images.smallThumbnail ||
      images.openLibraryLarge ||
      images.openLibraryMedium ||
      images.openLibrarySmall
    );
  }
  if (resource.type === "article") {
    return resource.metadata.image;
  }
  if (resource.type === "newsletter") {
    // Prefer user-provided image, fallback to RSS metadata image
    return resource.image || resource.metadata.image;
  }
  if (resource.type === "video") {
    // Prefer high quality thumbnails from YouTube
    const thumbnails = resource.metadata.thumbnails;
    return (
      thumbnails.maxres?.url ||
      thumbnails.standard?.url ||
      thumbnails.high?.url ||
      thumbnails.medium?.url ||
      thumbnails.default?.url
    );
  }
  return (resource as any).image;
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

/**
 * Get all unique licenses
 */
export function getAllLicenses(): string[] {
  const resources = getAllResources();
  const licenses = new Set(
    resources
      .map((r) => ("license" in r ? r.license : undefined))
      .filter((license): license is string => typeof license === "string")
  );
  return Array.from(licenses).sort();
}

/**
 * Get all unique languages
 */
export function getAllLanguages(): string[] {
  const resources = getAllResources();
  const languages = new Set<string>();

  for (const resource of resources) {
    if ("primaryLanguage" in resource && typeof resource.primaryLanguage === "string") {
      languages.add(resource.primaryLanguage);
    }
    if ("languages" in resource && Array.isArray(resource.languages)) {
      for (const lang of resource.languages) {
        if (typeof lang === "string") {
          languages.add(lang);
        }
      }
    }
  }

  return Array.from(languages).sort();
}

/**
 * Sort and rank resources according to Phase 4 requirements:
 * 1. First group: featured and trending
 * 2. Second group: resources with images
 * 3. Third group: resources without images
 */
export function rankResources(resources: Resource[]): Resource[] {
  const featured = resources.filter((r) => r.featured || r.trending);
  const withImages = resources.filter((r) => !r.featured && !r.trending && getResourceImage(r));
  const withoutImages = resources.filter((r) => !r.featured && !r.trending && !getResourceImage(r));

  return [...featured, ...withImages, ...withoutImages];
}
