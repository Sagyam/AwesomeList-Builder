import type { Paper } from "@/schema/ts/paper.interface";
import { arxivClient } from "../arxiv-client";
import {
    loadResources,
    saveResource,
    printStats,
    loadMetadata,
    shouldRefresh,
    updateMetadataTimestamp,
    sleep,
    type FetchStats
} from "./common";

async function fetchPapers(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    const papers = resources.filter(r => r.type === "paper") as Paper[];

    const stats: FetchStats = {
        total: papers.length,
        updated: 0,
        failed: 0,
        skipped: 0
    };

    console.log(`Found ${papers.length} papers`);
    console.log("Fetching arXiv metadata...");

    // Process in batches to respect rate limits
    const batchSize = 1; // arXiv is strict, let's go slow or use the client's built-in rate limiting

    for (let i = 0; i < papers.length; i++) {
        const paper = papers[i];
        try {
            if (!paper.arxivId) {
                console.warn(`Paper ${paper.id} has no arxivId, skipping`);
                stats.skipped++;
                continue;
            }

            const metadata = await arxivClient.fetchPaperMetadata(paper.arxivId);

            if (metadata) {
                paper.title = metadata.title;
                paper.authors = metadata.authors;
                paper.abstract = metadata.abstract;
                paper.published = metadata.published;
                paper.doi = metadata.doi || paper.doi;
                paper.venue = metadata.venue || paper.venue;
                paper.pdfUrl = metadata.pdfUrl;
                paper.field = metadata.field || paper.field;
                paper.keywords = paper.keywords || metadata.categories;

                if (metadata.coverImagePath) {
                    paper.image = metadata.coverImagePath;
                    paper.imageAlt = `${metadata.title} - Research Paper`;
                    console.log(`✅ Cover image set for: ${paper.id}`);
                }

                saveResource(paper);
                stats.updated++;
                console.log(`✅ Updated paper: ${paper.id}`);
            } else {
                stats.failed++;
            }

            // Wait between requests
            if (i < papers.length - 1) {
                await sleep(3000);
            }
        } catch (error) {
            console.error(`Failed to update paper ${paper.id}:`, error);
            stats.failed++;
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Paper Fetch Statistics");
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchPapers(force).catch(console.error);
}

export { fetchPapers };
