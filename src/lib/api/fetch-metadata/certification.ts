import type {Certification} from "@/schema/ts/certification.interface";
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

async function fetchCertifications(force = false) {
  const metadata = loadMetadata();

  if (!shouldRefresh(metadata, force)) {
    console.log("Data refresh not needed. Use --force to override.");
    return;
  }

  const resources = loadResources();
  const certifications = resources.filter((r) => r.type === "certification") as Certification[];

  const stats: FetchStats = {
    total: certifications.length,
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  console.log(`Found ${certifications.length} certifications`);
  console.log("Fetching certification metadata from web scraping...");

  for (const certification of certifications) {
    try {
      if (!certification.certificationUrl) {
        console.warn(`Certification ${certification.id} has no certificationUrl, skipping`);
        stats.skipped++;
        continue;
      }

      const metadata = await metadataClient.fetchCertificationMetadata(
        certification.certificationUrl
      );

      if (metadata) {
        certification.metadata = metadata;

        saveResource(certification);
        stats.updated++;
        console.log(
          `✅ Updated certification: ${certification.id} (${metadata.title}) - Provider: ${metadata.provider}`
        );
      } else {
        console.warn(
          `No metadata found for certification: ${certification.id} (url: ${certification.certificationUrl})`
        );
        stats.failed++;
      }
    } catch (error) {
      console.error(`Failed to update certification ${certification.id}:`, error);
      stats.failed++;
    }
  }

  if (stats.updated > 0) {
    updateMetadataTimestamp();
  }

  printStats(stats, "Certification Fetch Statistics");
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv.includes("--force");
  fetchCertifications(force).catch(console.error);
}

export { fetchCertifications };
