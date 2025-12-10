#!/usr/bin/env node
/**
 * Cache management CLI tool
 */

import {cacheManager} from "./cache-manager.ts";

const commands = {
  stats: () => {
    const stats = cacheManager.getStats();
    console.log("Cache Statistics:");
    console.log(`  Total entries: ${stats.total}`);
    console.log(`  Total size: ${(stats.size / 1024).toFixed(2)} KB`);
  },

  clean: () => {
    const cleaned = cacheManager.cleanExpired();
    console.log(`Cleaned ${cleaned} expired cache entries`);
    const stats = cacheManager.getStats();
    console.log(`Remaining: ${stats.total} entries`);
  },

  clear: () => {
    cacheManager.clear();
    console.log("Cache cleared successfully");
  },

  help: () => {
    console.log(`
Cache Management Tool

Usage:
  bun run src/lib/api/cache-cli.ts <command>

Commands:
  stats   Show cache statistics
  clean   Remove expired cache entries
  clear   Clear all cache
  help    Show this help message

Examples:
  bun run src/lib/api/cache-cli.ts stats
  bun run src/lib/api/cache-cli.ts clean
  bun run src/lib/api/cache-cli.ts clear
    `);
  },
};

// Parse command line arguments
const command = process.argv[2];

if (!command || !(command in commands)) {
  console.error(`Unknown command: ${command || "(none)"}\n`);
  commands.help();
  process.exit(1);
}

// Execute command
commands[command as keyof typeof commands]();
