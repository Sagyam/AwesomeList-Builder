import {Calendar, Headphones} from "lucide-react";
import {CardContent} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface PodcastCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Podcast-specific metadata
    author?: string;
    episodeCount?: number;
    language?: string;
    lastUpdated?: string;
    frequency?: string;
}

/**
 * PodcastCard - Specialized card for podcast resources
 * Displays podcast-specific metadata like episodes, frequency
 */
export function PodcastCard({
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
                                episodeCount,
                                language,
                                lastUpdated,
                                frequency,
                            }: PodcastCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("podcast");
    const typeHoverColor = TYPE_HOVER_COLORS.podcast;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
        } catch {
            return dateStr;
        }
    };

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

            {/* Podcast-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {author && (
                        <div className="text-sm font-medium text-muted-foreground">
                            by {author}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {episodeCount !== undefined && (
                            <CardMetadataRow icon={Headphones} value={`${episodeCount} episodes`}/>
                        )}
                        {lastUpdated && (
                            <CardMetadataRow icon={Calendar} value={formatDate(lastUpdated)}/>
                        )}
                    </div>

                    {frequency && (
                        <div className="text-xs text-muted-foreground">
                            {frequency}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>
        </BaseCardContainer>
    );
}
