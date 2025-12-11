import type { Repository } from "@/schema/ts/repository.interface";
import type { Library } from "@/schema/ts/library.interface";
import { githubClient } from "../github-client";
import { gitlabClient } from "../gitlab-client";
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

async function fetchRepositories(force = false) {
    const metadata = loadMetadata();

    if (!shouldRefresh(metadata, force)) {
        console.log("Data refresh not needed. Use --force to override.");
        return;
    }

    const resources = loadResources();
    // Repositories and Libraries both use repo metadata
    const repos = resources.filter(r => r.type === "repository" || r.type === "library") as (Repository | Library)[];

    const stats: FetchStats = {
        total: repos.length,
        updated: 0,
        failed: 0,
        skipped: 0
    };

    console.log(`Found ${repos.length} repositories/libraries`);
    console.log("Fetching GitHub/GitLab metadata...");

    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
        const batch = repos.slice(i, i + batchSize);

        await Promise.all(batch.map(async (resource) => {
            try {
                const repoUrl = resource.type === "repository"
                    ? (resource as Repository).repositoryUrl
                    : (resource as Library).repository;

                if (!repoUrl) {
                    stats.skipped++;
                    return;
                }

                const isGitHub = repoUrl.includes("github.com");
                const isGitLab = repoUrl.includes("gitlab.com");
                let metadata = null;

                if (isGitHub) {
                    metadata = await githubClient.fetchRepositoryMetadata(repoUrl);
                } else if (isGitLab) {
                    metadata = await gitlabClient.fetchRepositoryMetadata(repoUrl);
                } else {
                    stats.skipped++;
                    return;
                }

                if (metadata) {
                    resource.homepage = metadata.homepage || resource.homepage;
                    resource.license = metadata.license || resource.license;
                    resource.stars = metadata.stars;
                    resource.forks = metadata.forks;
                    resource.watchers = metadata.watchers;
                    resource.openIssues = metadata.openIssues;
                    resource.openPullRequests = metadata.openPullRequests;
                    resource.lastCommit = metadata.lastCommit;
                    resource.lastReleaseVersion = metadata.lastReleaseVersion;
                    resource.lastReleaseDate = metadata.lastReleaseDate;
                    resource.created = metadata.created;
                    resource.languages = metadata.languages;
                    resource.archived = metadata.archived;
                    resource.hasWiki = metadata.hasWiki;
                    resource.hasDiscussions = metadata.hasDiscussions;
                    resource.topics = [...metadata.topics];
                    resource.image = metadata.image;
                    resource.imageAlt = `${metadata.owner || metadata.name}'s avatar`;

                    if (resource.type === "repository") {
                        const repo = resource as Repository;
                        repo.owner = metadata.owner;
                        repo.ownerUrl = metadata.ownerUrl;
                        repo.primaryLanguage = metadata.primaryLanguage || repo.primaryLanguage;
                    }

                    saveResource(resource);
                    stats.updated++;
                    console.log(`✅ Updated ${resource.type}: ${resource.id}`);
                } else {
                    stats.failed++;
                }
            } catch (error) {
                console.error(`Failed to update ${resource.id}:`, error);
                stats.failed++;
            }
        }));

        if (i + batchSize < repos.length) {
            await sleep(1000);
        }
    }

    if (stats.updated > 0) {
        updateMetadataTimestamp();
    }

    printStats(stats, "Repository Fetch Statistics");
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes("--force");
    fetchRepositories(force).catch(console.error);
}

export { fetchRepositories };
