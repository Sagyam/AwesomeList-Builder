import type {Community} from "@/schema/ts/community.interface";
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

async function fetchCommunities(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const communities = resources.filter((r) => r.type === "community") as Community[];

    const stats: FetchStats = {
        total: communities.length,
        updated: 0,
        failed: 0,
        skipped: 0,
    };

    console.log(`Found ${communities.length} communities`);
    console.log("Fetching community metadata from web scraping...");

    for (const community of communities) {
        try {
            if (!community.communityUrl) {
                console.warn(`Community ${community.id} has no communityUrl, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await metadataClient.fetchCommunityMetadata(community.communityUrl);

            if (metadata) {
                community.metadata = metadata;

                saveResource(community);
                stats.updated++;
                console.log(
                    `✅ Updated community: ${community.id} (${metadata.name}) - Platform: ${metadata.platform}, Members: ${metadata.members?.toLocaleString() || 'N/A'}`
                );
            } else {
                console.warn(`No metadata found for community: ${community.id} (url: ${community.communityUrl})`);
                stats.failed++;
            }
        } catch (error) {
            console.error(`Failed to update community ${community.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Community Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchCommunities(force).catch(console.error);
}

export {fetchCommunities};
