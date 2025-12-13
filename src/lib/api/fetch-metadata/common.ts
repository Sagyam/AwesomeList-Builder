import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import type {Resource} from "@/schema/ts/types";

export interface FetchStats {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
}

export interface CacheConfig {
  ttl: number; // TTL in days
  lastRefresh: string | null;
  regenerate?: boolean; // For screenshots: force regenerate
}

export interface MetadataConfig {
  dataRefresh?: {
    enabled: boolean;
    cache?: {
      metadata?: CacheConfig;
      screenshots?: CacheConfig;
      ai?: CacheConfig;
    };
    // Legacy support
    intervalDays?: number;
    lastRefresh?: string | null;
  };
}

export const RESOURCES_DIR = path.resolve(process.cwd(), "src/data/resources");
export const METADATA_FILE = path.resolve(process.cwd(), "src/data/metadata.yaml");

/**
 * Load all resource YAML files
 */
export function loadResources(resourcesDir: string = RESOURCES_DIR): Resource[] {
  const resources: Resource[] = [];

  if (!fs.existsSync(resourcesDir)) {
    console.warn(`Resources directory not found: ${resourcesDir}`);
    return resources;
  }

  const files = fs.readdirSync(resourcesDir);

  for (const file of files) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;

    try {
      const filePath = path.join(resourcesDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const resource = yaml.parse(content) as Resource;
      // Store the file path for later updates
      Object.defineProperty(resource, "__filePath", {
        value: filePath,
        enumerable: false,
        writable: true,
      });
      resources.push(resource);
    } catch (error) {
      console.warn(`Failed to load resource from ${file}:`, error);
    }
  }

  return resources;
}

/**
 * Save a resource back to its YAML file
 */
export function saveResource(resource: Resource): void {
  const filePath = (resource as any).__filePath;
  if (filePath) {
    const content = yaml.stringify(resource);
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

/**
 * Load metadata configuration
 */
export function loadMetadata(metadataPath: string = METADATA_FILE): MetadataConfig {
  try {
    if (!fs.existsSync(metadataPath)) {
      return {};
    }
    const content = fs.readFileSync(metadataPath, "utf-8");
    return yaml.parse(content) as MetadataConfig;
  } catch (error) {
    console.warn("Failed to load metadata.yaml:", error);
    return {};
  }
}

/**
 * Update lastRefresh timestamp for a specific cache type
 */
export function updateCacheTimestamp(
  cacheType: "metadata" | "screenshots" | "ai",
  metadataPath: string = METADATA_FILE
): void {
  try {
    if (!fs.existsSync(metadataPath)) {
      return;
    }

    const content = fs.readFileSync(metadataPath, "utf-8");
    const metadata = yaml.parse(content);

    if (!metadata.dataRefresh) {
      metadata.dataRefresh = {
        enabled: true,
        cache: {},
      };
    }

    if (!metadata.dataRefresh.cache) {
      metadata.dataRefresh.cache = {};
    }

    if (!metadata.dataRefresh.cache[cacheType]) {
      metadata.dataRefresh.cache[cacheType] = {
        ttl: cacheType === "metadata" ? 1 : cacheType === "screenshots" ? 0 : 30,
        lastRefresh: null,
      };
    }

    metadata.dataRefresh.cache[cacheType].lastRefresh = new Date().toISOString();

    fs.writeFileSync(metadataPath, yaml.stringify(metadata), "utf-8");
    console.log(`✅ Updated ${cacheType} cache timestamp`);
  } catch (error) {
    console.warn(`Failed to update ${cacheType} cache timestamp:`, error);
  }
}

/**
 * Legacy function - updates metadata cache timestamp
 */
export function updateMetadataTimestamp(metadataPath: string = METADATA_FILE): void {
  updateCacheTimestamp("metadata", metadataPath);
}

/**
 * Check if a specific cache type needs refresh
 */
export function shouldRefreshCache(
  metadata: MetadataConfig,
  cacheType: "metadata" | "screenshots" | "ai",
  force = false
): boolean {
  if (force) return true;

  const config = metadata.dataRefresh;

  if (!config || !config.enabled) {
    return true; // Refresh if not configured
  }

  // New granular cache system
  if (config.cache && config.cache[cacheType]) {
    const cache = config.cache[cacheType];

    // For screenshots, check regenerate flag
    if (cacheType === "screenshots" && cache.regenerate === false) {
      return false; // Don't regenerate existing screenshots
    }

    if (!cache.lastRefresh) {
      return true; // Never refreshed before
    }

    const lastRefresh = new Date(cache.lastRefresh);
    const now = new Date();
    const daysSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceRefresh >= cache.ttl;
  }

  // Legacy fallback
  if (config.lastRefresh) {
    const lastRefresh = new Date(config.lastRefresh);
    const now = new Date();
    const daysSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60 * 24);
    const intervalDays = config.intervalDays || 7;

    return daysSinceRefresh >= intervalDays;
  }

  return true; // Default to refresh
}

/**
 * Legacy function - checks metadata cache
 */
export function shouldRefresh(metadata: MetadataConfig, force = false): boolean {
  return shouldRefreshCache(metadata, "metadata", force);
}

export function printStats(stats: FetchStats, label = "Fetch Statistics"): void {
  console.log(`\n=== ${label} ===`);
  console.log(`Total resources: ${stats.total}`);
  console.log(`Updated: ${stats.updated}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped: ${stats.skipped}`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
