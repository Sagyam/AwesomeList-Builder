import type { Podcast } from "@/schema/ts/podcast.interface";
import { podcastClient } from "../podcast-client";
import {
    loadResources,
    saveResource,
    printStats,
    loadMetadata,
    shouldRefresh,
    updateMetadataTimestamp,
    type FetchStats
} from "./common";

async function fetchPodcasts(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const podcasts = resources.filter(r => r.type === "podcast") as Podcast[];

    const stats: FetchStats = {
        total: podcasts.length,
        updated: 0,
        failed: 0,
        skipped: 0
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
                podcast.title = metadata.title;
                podcast.description = metadata.description;
                podcast.image = metadata.image || podcast.image;
                podcast.host = metadata.author || podcast.host;
                // If hostUrl is missing, try to use the link from RSS
                podcast.hostUrl = podcast.hostUrl || metadata.link;
                // If main url is missing, use the link from RSS
                podcast.url = podcast.url || metadata.link || "";

                if (metadata.lastBuildDate) {
                    try {
                        podcast.published = new Date(metadata.lastBuildDate).toISOString();
                    } catch (e) {
                        console.warn(`Invalid date for podcast ${podcast.id}: ${metadata.lastBuildDate}`);
                    }
                }

                if (metadata.episodes && metadata.episodes.length > 0) {
                    podcast.episodes = metadata.episodes.map(ep => {
                        let published = new Date().toISOString();
                        try {
                            published = new Date(ep.published).toISOString();
                        } catch (e) {
                            // keep default
                        }
                        return {
                            title: ep.title,
                            published,
                            duration: ep.duration,
                            url: ep.url,
                            image: ep.image
                        };
                    });
                }

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

    // Only update timestamp if we ran a full update (implied by this script usually being part of a larger process, 
    // but if run standalone we might not want to update the global timestamp? 
    // Actually, if we update podcasts, we should probably update the timestamp or maybe have granular timestamps.
    // For now, let's update it if we did work.)
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
