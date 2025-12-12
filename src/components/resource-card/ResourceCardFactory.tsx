import type {DisplayResource} from "@/schema/ts/base.interface";
import {VideoCard} from "./types/VideoCard";
import {BookCard} from "./types/BookCard";
import {PodcastCard} from "./types/PodcastCard";
import {PaperCard} from "./types/PaperCard";
import {NewsletterCard} from "./types/NewsletterCard";
import {CertificationCard} from "./types/CertificationCard";
import {CheatsheetCard} from "./types/CheatsheetCard";
import {CommunityCard} from "./types/CommunityCard";
import {ConferenceCard} from "./types/ConferenceCard";
import {DocumentationCard} from "./types/DocumentationCard";
import {ToolCard} from "./types/ToolCard";
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

        case "certification":
            return (
                <CertificationCard
                    {...baseProps}
                    provider={(resource as any).metadata?.provider}
                    providerUrl={(resource as any).metadata?.providerUrl}
                    examCode={(resource as any).metadata?.examCode}
                    duration={(resource as any).metadata?.duration}
                    examDuration={(resource as any).metadata?.examDuration}
                    cost={(resource as any).metadata?.cost}
                    format={(resource as any).metadata?.format}
                    difficultyLevel={(resource as any).metadata?.difficultyLevel}
                    certificationUrl={(resource as any).certificationUrl}
                />
            );

        case "cheatsheet":
            return (
                <CheatsheetCard
                    {...baseProps}
                    author={(resource as any).metadata?.author}
                    authorUrl={(resource as any).metadata?.authorUrl}
                    subject={(resource as any).metadata?.subject}
                    format={(resource as any).metadata?.format}
                    pages={(resource as any).metadata?.pages}
                    downloadUrl={(resource as any).metadata?.downloadUrl}
                    printable={(resource as any).metadata?.printable}
                    interactive={(resource as any).metadata?.interactive}
                    version={(resource as any).metadata?.version}
                />
            );

        case "community":
            return (
                <CommunityCard
                    {...baseProps}
                    platform={(resource as any).metadata?.platform}
                    members={(resource as any).metadata?.members}
                    onlineMembers={(resource as any).metadata?.onlineMembers}
                    activity={(resource as any).metadata?.activity}
                    verified={(resource as any).metadata?.verified}
                    inviteOnly={(resource as any).metadata?.inviteOnly}
                    languages={(resource as any).metadata?.languages}
                    communityUrl={(resource as any).communityUrl}
                />
            );

        case "conference":
            return (
                <ConferenceCard
                    {...baseProps}
                    organizer={(resource as any).metadata?.organizer}
                    startDate={(resource as any).metadata?.startDate}
                    endDate={(resource as any).metadata?.endDate}
                    location={(resource as any).metadata?.location}
                    virtual={(resource as any).metadata?.virtual}
                    hybrid={(resource as any).metadata?.hybrid}
                    attendees={(resource as any).metadata?.attendees}
                    registrationUrl={(resource as any).metadata?.registrationUrl}
                />
            );

        case "documentation":
            return (
                <DocumentationCard
                    {...baseProps}
                    project={(resource as any).metadata?.project}
                    version={(resource as any).metadata?.version}
                    format={(resource as any).metadata?.format}
                    officialDocs={(resource as any).metadata?.officialDocs}
                    searchable={(resource as any).metadata?.searchable}
                    interactive={(resource as any).metadata?.interactive}
                    lastUpdated={(resource as any).metadata?.lastUpdated}
                    languages={(resource as any).metadata?.languages}
                    repository={(resource as any).metadata?.repository}
                    documentationUrl={(resource as any).documentationUrl}
                />
            );

        case "tool":
            return (
                <ToolCard
                    {...baseProps}
                    developer={(resource as any).metadata?.developer}
                    developerUrl={(resource as any).metadata?.developerUrl}
                    version={(resource as any).metadata?.version}
                    platforms={(resource as any).metadata?.platforms}
                    pricing={(resource as any).metadata?.pricing}
                    isOpenSource={(resource as any).metadata?.isOpenSource}
                    license={(resource as any).metadata?.license}
                    category={(resource as any).metadata?.category}
                    downloadUrl={(resource as any).metadata?.downloadUrl}
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
