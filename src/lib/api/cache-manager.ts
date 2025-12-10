/**
 * Cache Manager for API responses
 * Stores cached data in the cache/ directory
 */

import fs from "node:fs";
import path from "node:path";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cacheDir: string;

  constructor(cacheDir = "cache") {
    this.cacheDir = path.resolve(process.cwd(), cacheDir);
    this.ensureCacheDir();
  }

  /**
   * Get cached data if valid
   */
  get<T>(key: string): T | null {
    try {
      const cachePath = this.getCachePath(key);

      if (!fs.existsSync(cachePath)) {
        return null;
      }

      const content = fs.readFileSync(cachePath, "utf-8");
      const entry: CacheEntry<T> = JSON.parse(content);

      // Check if cache is still valid
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        // Cache expired, delete it
        fs.unlinkSync(cachePath);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`Failed to read cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache data
   */
  set<T>(key: string, data: T, ttl = 3600000): void {
    try {
      const cachePath = this.getCachePath(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      fs.writeFileSync(cachePath, JSON.stringify(entry, null, 2), "utf-8");
    } catch (error) {
      console.warn(`Failed to write cache for key ${key}:`, error);
    }
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    try {
      const cachePath = this.getCachePath(key);
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
    } catch (error) {
      console.warn(`Failed to delete cache for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            fs.unlinkSync(path.join(this.cacheDir, file));
          }
        }
      }
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { total: number; size: number } {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        return { total: 0, size: 0 };
      }

      const files = fs.readdirSync(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(this.cacheDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      }

      return {
        total: files.filter((f) => f.endsWith(".json")).length,
        size: totalSize,
      };
    } catch (error) {
      console.warn("Failed to get cache stats:", error);
      return { total: 0, size: 0 };
    }
  }

  /**
   * Clean expired cache entries
   */
  cleanExpired(): number {
    let cleaned = 0;

    try {
      if (!fs.existsSync(this.cacheDir)) {
        return 0;
      }

      const files = fs.readdirSync(this.cacheDir);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith(".json")) continue;

        const filePath = path.join(this.cacheDir, file);
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          const entry: CacheEntry<unknown> = JSON.parse(content);

          if (now - entry.timestamp > entry.ttl) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        } catch {
          // Invalid cache file, delete it
          fs.unlinkSync(filePath);
          cleaned++;
        }
      }
    } catch (error) {
      console.warn("Failed to clean expired cache:", error);
    }

    return cleaned;
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate a cache key from a string
   */
  private getCacheKey(key: string): string {
    return key.replace(/[^a-z0-9-_]/gi, "_").toLowerCase();
  }

  /**
   * Get cache file path
   */
  private getCachePath(key: string): string {
    const safeKey = this.getCacheKey(key);
    return path.join(this.cacheDir, `${safeKey}.json`);
  }
}

// Export a singleton instance
export const cacheManager = new CacheManager();
