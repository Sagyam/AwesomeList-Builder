import type {DisplayResource} from "@/schema/ts/base.interface";
import {VideoCard} from "./types/VideoCard";
import {BookCard} from "./types/BookCard";
import {PodcastCard} from "./types/PodcastCard";
import {PaperCard} from "./types/PaperCard";
import {NewsletterCard} from "./types/NewsletterCard";
import {GenericCard} from "./types/GenericCard";

/**
 * ResourceCardFactory - Routes resources to their specialized card components
 * Falls back to GenericCard for types without specialized implementations
 */
export function ResourceCardFactory({resource}: { resource: DisplayResource }) {
    const baseProps = {
        id: resource.id,
        name: resource.name,
        description: resource.description,
        image: resource.image,
        imageAlt: resource.imageAlt,
        tags: resource.tags,
        featured: resource.featured,
        trending: resource.trending,
        archived: resource.archived,
    };

    // Route to specialized cards based on type
    switch (resource.type) {
        case "video":
            return (
                <VideoCard
                    {...baseProps}
                    views={(resource as any).views}
                    likes={(resource as any).likes}
                    comments={(resource as any).comments}
                    duration={(resource as any).duration}
                    channel={(resource as any).channel}
                    publishedDate={(resource as any).publishedDate}
                />
            );

        case "book":
            return (
                <BookCard
                    {...baseProps}
                    authors={(resource as any).authors}
                    publisher={(resource as any).publisher}
                    publishedDate={(resource as any).publishedDate}
                    pageCount={(resource as any).pageCount}
                    rating={(resource as any).rating}
                    categories={(resource as any).categories}
                />
            );

        case "podcast":
            return (
                <PodcastCard
                    {...baseProps}
                    author={(resource as any).author}
                    episodeCount={(resource as any).episodeCount}
                    language={resource.language}
                    lastUpdated={(resource as any).lastUpdated}
                    frequency={(resource as any).frequency}
                />
            );

        case "paper":
            return (
                <PaperCard
                    {...baseProps}
                    authors={(resource as any).authors}
                    published={(resource as any).published}
                    venue={(resource as any).venue}
                    citations={(resource as any).citations}
                    field={(resource as any).field}
                    arxivId={(resource as any).arxivId}
                    pdfUrl={(resource as any).pdfUrl}
                />
            );

        case "newsletter":
            return (
                <NewsletterCard
                    {...baseProps}
                    author={(resource as any).author}
                    platform={(resource as any).platform}
                    frequency={(resource as any).frequency}
                    format={(resource as any).format}
                    subscribers={(resource as any).subscribers}
                    latestIssueTitle={(resource as any).latestIssueTitle}
                    latestIssueDate={(resource as any).latestIssueDate}
                    latestIssueUrl={(resource as any).latestIssueUrl}
                    subscribeUrl={(resource as any).subscribeUrl}
                    archiveUrl={(resource as any).archiveUrl}
                />
            );

        // All other types use the generic card
        default:
            return (
                <GenericCard
                    {...baseProps}
                    type={resource.type}
                    language={resource.language}
                    languages={resource.languages}
                    stars={resource.stars}
                    license={resource.license}
                    registry={resource.registry}
                    packageName={resource.packageName}
                    lastReleaseVersion={resource.lastReleaseVersion}
                    downloads={resource.downloads}
                />
            );
    }
}
