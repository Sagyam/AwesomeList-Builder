import {fetchArticles} from "./article";
import {fetchPodcasts} from "./podcast";
import {fetchPapers} from "./paper";
import {fetchRepositories} from "./repository";
import {fetchBooks} from "./book";

async function fetchAll(force = false) {
    console.log("🚀 Starting full metadata update...");

    try {
        await fetchRepositories(force);
        await fetchPapers(force);
        await fetchPodcasts(force);
        await fetchBooks(force);
        await fetchArticles(force);

        console.log("\n✨ All metadata updates completed!");
    } catch (error) {
        console.error("Fatal error during metadata update:", error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchAll(force);
}
