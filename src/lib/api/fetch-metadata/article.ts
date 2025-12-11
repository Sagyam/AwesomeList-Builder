import type {Article} from "@/schema/ts/article.interface";
import {articleClient} from "../article-client";
import {
    type FetchStats,
    loadMetadata,
    loadResources,
    printStats,
    saveResource,
    shouldRefresh,
    updateMetadataTimestamp,
} from "./common";

async function fetchArticles(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const articles = resources.filter((r) => r.type === "article") as Article[];

  const stats: FetchStats = {
    total: articles.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${articles.length} articles`);
  console.log("Fetching article metadata...");

  for (const article of articles) {
    try {
      if (!article.url) {
        console.warn(`Article ${article.id} has no URL, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await articleClient.fetchArticleMetadata(article.url, article.rssUrl);

      if (metadata) {
        article.metadata = metadata;

        saveResource(article);
        stats.updated++;
        console.log(`✅ Updated article: ${article.id}`);
      } else {
        console.warn(`No metadata found for article: ${article.id}`);
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update article ${article.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Article Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchArticles(force).catch(console.error);
}

export { fetchArticles };
