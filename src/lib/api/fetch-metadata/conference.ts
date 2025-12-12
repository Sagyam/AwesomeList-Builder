import type {Conference} from "@/schema/ts/conference.interface";
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

async function fetchConferences(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const conferences = resources.filter((r) => r.type === "conference") as Conference[];

    const stats: FetchStats = {
        total: conferences.length,
        updated: 0,
        failed: 0,
        skipped: 0,
    };

    console.log(`Found ${conferences.length} conferences`);
    console.log("Fetching conference metadata from web scraping...");

    for (const conference of conferences) {
        try {
            if (!conference.conferenceUrl) {
                console.warn(`Conference ${conference.id} has no conferenceUrl, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await metadataClient.fetchConferenceMetadata(conference.conferenceUrl);

            if (metadata) {
                conference.metadata = metadata;

                saveResource(conference);
                stats.updated++;
                console.log(
                    `✅ Updated conference: ${conference.id} (${metadata.name}) - Location: ${metadata.location || 'Virtual'}, Date: ${metadata.startDate || 'TBD'}`
                );
            } else {
                console.warn(`No metadata found for conference: ${conference.id} (url: ${conference.conferenceUrl})`);
                stats.failed++;
            }
        } catch (error) {
            console.error(`Failed to update conference ${conference.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Conference Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchConferences(force).catch(console.error);
}

export {fetchConferences};
