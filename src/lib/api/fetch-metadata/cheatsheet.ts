import type {Cheatsheet} from "@/schema/ts/cheatsheet.interface";
import {MetadataClient} from "../metadata-client";
import {
    type FetchStats,
    loadMetadata,
    loadResources,
    printStats,
    saveResource,
    shouldRefresh,
    updateMetadataTimestamp,
} from "./common";

const metadataClient = new MetadataClient();

async function fetchCheatsheets(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const cheatsheets = resources.filter((r) => r.type === "cheatsheet") as Cheatsheet[];

  const stats: FetchStats = {
    total: cheatsheets.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${cheatsheets.length} cheatsheets`);
  console.log("Fetching cheatsheet metadata from web scraping...");

  for (const cheatsheet of cheatsheets) {
    try {
      if (!cheatsheet.cheatsheetUrl) {
        console.warn(`Cheatsheet ${cheatsheet.id} has no cheatsheetUrl, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await metadataClient.fetchCheatsheetMetadata(cheatsheet.cheatsheetUrl);

      if (metadata) {
        cheatsheet.metadata = metadata;

        saveResource(cheatsheet);
        stats.updated++;
        console.log(
          `✅ Updated cheatsheet: ${cheatsheet.id} (${metadata.title}) - Subject: ${metadata.subject}`
        );
      } else {
        console.warn(
          `No metadata found for cheatsheet: ${cheatsheet.id} (url: ${cheatsheet.cheatsheetUrl})`
        );
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update cheatsheet ${cheatsheet.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Cheatsheet Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchCheatsheets(force).catch(console.error);
}

export { fetchCheatsheets };
