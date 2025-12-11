import type {Newsletter} from "@/schema/ts/newsletter.interface";
import {newsletterClient} from "../newsletter-client";
import {
  type FetchStats,
  loadMetadata,
  loadResources,
  printStats,
  saveResource,
  shouldRefresh,
  updateMetadataTimestamp,
} from "./common";

async function fetchNewsletters(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const newsletters = resources.filter((r) => r.type === "newsletter") as Newsletter[];

  const stats: FetchStats = {
    total: newsletters.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${newsletters.length} newsletters`);
  console.log("Fetching newsletter metadata...");

  for (const newsletter of newsletters) {
    try {
      if (!newsletter.rssUrl) {
        console.warn(`Newsletter ${newsletter.id} has no RSS URL, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await newsletterClient.fetchNewsletterMetadata(newsletter.rssUrl);

      if (metadata) {
        newsletter.metadata = metadata;

        saveResource(newsletter);
        stats.updated++;
        console.log(`✅ Updated newsletter: ${newsletter.id}`);
      } else {
        console.warn(`No metadata found for newsletter: ${newsletter.id}`);
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update newsletter ${newsletter.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Newsletter Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchNewsletters(force).catch(console.error);
}

export { fetchNewsletters };
