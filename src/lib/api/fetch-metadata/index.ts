import {fetchArticles} from "./article";
import {fetchBooks} from "./book";
import {fetchCertifications} from "./certification";
import {fetchCheatsheets} from "./cheatsheet";
import {fetchCommunities} from "./community";
import {fetchConferences} from "./conference";
import {fetchDocumentations} from "./documentation";
import {fetchNewsletters} from "./newsletter";
import {fetchPapers} from "./paper";
import {fetchPodcasts} from "./podcast";
import {fetchRepositories} from "./repository";
import {fetchTools} from "./tool";
import {fetchVideos} from "./video";

async function fetchAll(force = false) {
  console.log("🚀 Starting full metadata update...");

  const fetchFunctions = [
    { name: "Repositories", fn: fetchRepositories },
    { name: "Papers", fn: fetchPapers },
    { name: "Podcasts", fn: fetchPodcasts },
    { name: "Books", fn: fetchBooks },
    { name: "Articles", fn: fetchArticles },
    { name: "Newsletters", fn: fetchNewsletters },
    { name: "Videos", fn: fetchVideos },
    { name: "Certifications", fn: fetchCertifications },
    { name: "Cheatsheets", fn: fetchCheatsheets },
    { name: "Communities", fn: fetchCommunities },
    { name: "Conferences", fn: fetchConferences },
    { name: "Documentation", fn: fetchDocumentations },
    { name: "Tools", fn: fetchTools },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const { name, fn } of fetchFunctions) {
    try {
      await fn(force);
      successCount++;
    } catch (error) {
      console.error(`⚠️ Failed to fetch ${name}:`, error);
      failCount++;
      // Continue with other resource types
    }
  }

  console.log(`\n✨ Metadata update completed!`);
  console.log(`✅ Success: ${successCount}/${fetchFunctions.length}`);
  if (failCount > 0) {
    console.log(`⚠️ Failed: ${failCount}/${fetchFunctions.length}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchAll(force);
}
