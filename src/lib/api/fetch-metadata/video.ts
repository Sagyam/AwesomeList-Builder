import type {Video} from "@/schema/ts/video.interface";
import {youtubeClient} from "../youtube-client";
import {
  type FetchStats,
  loadMetadata,
  loadResources,
  printStats,
  saveResource,
  shouldRefresh,
  updateMetadataTimestamp,
} from "./common";

async function fetchVideos(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const videos = resources.filter((r) => r.type === "video") as Video[];

  const stats: FetchStats = {
    total: videos.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${videos.length} videos`);
  console.log("Fetching video metadata from YouTube Data API v3...");

  for (const video of videos) {
    try {
      if (!video.videoId) {
        console.warn(`Video ${video.id} has no videoId, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await youtubeClient.fetchVideoMetadata(video.videoId);

      if (metadata) {
        video.metadata = metadata;

        saveResource(video);
        stats.updated++;
        console.log(
          `✅ Updated video: ${video.id} (${metadata.title}) - ${metadata.statistics.viewCount.toLocaleString()} views`
        );
      } else {
        console.warn(`No metadata found for video: ${video.id} (videoId: ${video.videoId})`);
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update video ${video.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Video Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchVideos(force).catch(console.error);
}

export { fetchVideos };
