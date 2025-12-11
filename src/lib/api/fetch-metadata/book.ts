import type {Book} from "@/schema/ts/book.interface";
import {bookClient} from "../book-client";
import {
    type FetchStats,
    loadMetadata,
    loadResources,
    printStats,
    saveResource,
    shouldRefresh,
    updateMetadataTimestamp,
} from "./common";

async function fetchBooks(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const books = resources.filter((r) => r.type === "book") as Book[];

  const stats: FetchStats = {
    total: books.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${books.length} books`);
  console.log("Fetching book metadata from Google Books & Open Library...");

  for (const book of books) {
    try {
      if (!book.isbn) {
        console.warn(`Book ${book.id} has no ISBN, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await bookClient.fetchBookMetadata(book.isbn);

      if (metadata) {
        book.metadata = metadata;

        saveResource(book);
        stats.updated++;
        const sources = [];
        if (metadata.sources.googleBooks) sources.push("Google Books");
        if (metadata.sources.openLibrary) sources.push("Open Library");
        console.log(`✅ Updated book: ${book.id} (from ${sources.join(" + ")})`);
      } else {
        console.warn(`No metadata found for book: ${book.id} (ISBN: ${book.isbn})`);
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update book ${book.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Book Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchBooks(force).catch(console.error);
}

export { fetchBooks };
