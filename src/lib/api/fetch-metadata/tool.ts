import type {Tool} from "@/schema/ts/tool.interface";
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

async function fetchTools(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const tools = resources.filter((r) => r.type === "tool") as Tool[];

    const stats: FetchStats = {
        total: tools.length,
        updated: 0,
        failed: 0,
        skipped: 0,
    };

    console.log(`Found ${tools.length} tools`);
    console.log("Fetching tool metadata from web scraping...");

    for (const tool of tools) {
        try {
            if (!tool.toolUrl) {
                console.warn(`Tool ${tool.id} has no toolUrl, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await metadataClient.fetchToolMetadata(tool.toolUrl);

            if (metadata) {
                tool.metadata = metadata;

                saveResource(tool);
                stats.updated++;
                console.log(
                    `✅ Updated tool: ${tool.id} (${metadata.name}) - Pricing: ${metadata.pricing || 'N/A'}, Platforms: ${metadata.platforms?.join(', ') || 'N/A'}`
                );
            } else {
                console.warn(`No metadata found for tool: ${tool.id} (url: ${tool.toolUrl})`);
                stats.failed++;
            }
        } catch (error) {
            console.error(`Failed to update tool ${tool.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Tool Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchTools(force).catch(console.error);
}

export {fetchTools};
