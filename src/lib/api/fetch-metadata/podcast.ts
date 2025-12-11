import type {Podcast} from "@/schema/ts/podcast.interface";
import {podcastClient} from "../podcast-client";
import {
    type FetchStats,
    loadMetadata,
    loadResources,
    printStats,
    saveResource,
    shouldRefresh,
    updateMetadataTimestamp,
} from "./common";

async function fetchPodcasts(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const podcasts = resources.filter((r) => r.type === "podcast") as Podcast[];

    const stats: FetchStats = {
        total: podcasts.length,
        updated: 0,
        failed: 0,
        skipped: 0,
    };

    console.log(`Found ${podcasts.length} podcasts`);
    console.log("Fetching podcast metadata...");

    for (const podcast of podcasts) {
        try {
            if (!podcast.rssFeed) {
                console.warn(`Podcast ${podcast.id} has no rssFeed, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await podcastClient.fetchPodcastMetadata(podcast.rssFeed);

            if (metadata) {
                podcast.metadata = metadata;

                saveResource(podcast);
                stats.updated++;
                console.log(`✅ Updated podcast: ${podcast.id}`);
            } else {
                console.warn(`No metadata found for podcast: ${podcast.id}`);
                stats.failed++;
            }
        } catch (error) {
            console.error(`Failed to update podcast ${podcast.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Podcast Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchPodcasts(force).catch(console.error);
}

export { fetchPodcasts };
