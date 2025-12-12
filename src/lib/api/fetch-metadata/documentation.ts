import type {Documentation} from "@/schema/ts/documentation.interface";
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

async function fetchDocumentations(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const documentations = resources.filter((r) => r.type === "documentation") as Documentation[];

    const stats: FetchStats = {
        total: documentations.length,
        updated: 0,
        failed: 0,
        skipped: 0,
    };

    console.log(`Found ${documentations.length} documentations`);
    console.log("Fetching documentation metadata from web scraping...");

    for (const documentation of documentations) {
        try {
            if (!documentation.documentationUrl) {
                console.warn(`Documentation ${documentation.id} has no documentationUrl, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await metadataClient.fetchDocumentationMetadata(documentation.documentationUrl);

            if (metadata) {
                documentation.metadata = metadata;

                saveResource(documentation);
                stats.updated++;
                console.log(
                    `✅ Updated documentation: ${documentation.id} (${metadata.title}) - Project: ${metadata.project || 'N/A'}, Version: ${metadata.version || 'N/A'}`
                );
            } else {
                console.warn(`No metadata found for documentation: ${documentation.id} (url: ${documentation.documentationUrl})`);
                stats.failed++;
            }
        } catch (error) {
            console.error(`Failed to update documentation ${documentation.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Documentation Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchDocumentations(force).catch(console.error);
}

export {fetchDocumentations};
