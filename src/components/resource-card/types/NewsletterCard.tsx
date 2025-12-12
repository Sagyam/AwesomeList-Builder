import {Calendar, ExternalLink, Mail, Newspaper, Repeat} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface NewsletterCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Newsletter-specific metadata
    author?: string;
    platform?: string; // "Substack", "Mailchimp", "Cooperpress"
    frequency?: string; // "weekly", "biweekly", "monthly"
    format?: "email" | "web" | "both";
    subscribers?: number;
    latestIssueTitle?: string;
    latestIssueDate?: string;
    latestIssueUrl?: string;
    subscribeUrl?: string;
    archiveUrl?: string;
}

/**
 * NewsletterCard - Specialized card for newsletters
 * Displays newsletter-specific metadata like frequency, latest issue, platform
 */
export function NewsletterCard({
                                   id,
                                   name,
                                   description,
                                   image,
                                   imageAlt,
                                   tags = [],
                                   featured = false,
                                   trending = false,
                                   archived = false,
                                   author,
                                   platform,
                                   frequency,
                                   format,
                                   subscribers,
                                   latestIssueTitle,
                                   latestIssueDate,
                                   latestIssueUrl,
                                   subscribeUrl,
                                   archiveUrl,
                               }: NewsletterCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("newsletter");
    const typeHoverColor = TYPE_HOVER_COLORS.newsletter;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatSubscribers = (count?: number) => {
        if (!count) return null;
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const subscriberCount = formatSubscribers(subscribers);

    return (
        <BaseCardContainer id={id}>
            <ResourceCardMedia
                image={image}
                imageAlt={imageAlt}
                name={name}
                featured={featured}
                trending={trending}
                archived={archived}
            />

            <ResourceCardHeader
                name={name}
                description={description}
                TypeIcon={TypeIcon}
                typeLabel={typeLabel}
                typeHoverColor={typeHoverColor}
                hasImage={!!image}
                featured={featured}
                trending={trending}
                archived={archived}
            />

            {/* Newsletter-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {author && (
                        <div className="text-sm font-medium text-muted-foreground">
                            by {author}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {frequency && (
                            <CardMetadataRow
                                icon={Repeat}
                                value={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                            />
                        )}
                        {subscriberCount && (
                            <CardMetadataRow
                                icon={Mail}
                                value={`${subscriberCount} subscribers`}
                            />
                        )}
                        {format && (
                            <CardMetadataRow
                                icon={Newspaper}
                                value={format === "both" ? "Email + Web" : format.charAt(0).toUpperCase() + format.slice(1)}
                            />
                        )}
                    </div>

                    {/* Latest issue preview */}
                    {latestIssueTitle && (
                        <div className="mt-3 pt-3 border-t space-y-1">
                            <div className="text-xs text-muted-foreground">Latest Issue</div>
                            <div className="text-sm font-medium line-clamp-1">
                                {latestIssueTitle}
                            </div>
                            {latestIssueDate && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3"/>
                                    {formatDate(latestIssueDate)}
                                </div>
                            )}
                        </div>
                    )}

                    {platform && (
                        <div className="text-xs text-muted-foreground">
                            Powered by {platform}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with subscribe and archive links */}
            {(subscribeUrl || archiveUrl || latestIssueUrl) && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {subscribeUrl && (
                        <a
                            href={subscribeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Mail className="h-4 w-4"/>
                            <span>Subscribe</span>
                        </a>
                    )}
                    {archiveUrl && (
                        <a
                            href={archiveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Newspaper className="h-4 w-4"/>
                            <span>Archive</span>
                        </a>
                    )}
                    {latestIssueUrl && (
                        <a
                            href={latestIssueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-4 w-4"/>
                            <span>Latest</span>
                        </a>
                    )}
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
