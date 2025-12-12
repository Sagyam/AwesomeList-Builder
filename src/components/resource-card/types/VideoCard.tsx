import {Clock, Eye, MessageSquare, ThumbsUp} from "lucide-react";
import {CardContent} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface VideoCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Video-specific metadata
    views?: number;
    likes?: number;
    comments?: number;
    duration?: string;
    channel?: string;
    publishedDate?: string;
}

/**
 * VideoCard - Specialized card for video resources
 * Displays video-specific metadata like views, likes, duration
 */
export function VideoCard({
                              id,
                              name,
                              description,
                              image,
                              imageAlt,
                              tags = [],
                              featured = false,
                              trending = false,
                              archived = false,
                              views,
                              likes,
                              comments,
                              duration,
                              channel,
                              publishedDate,
                          }: VideoCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("video");
    const typeHoverColor = TYPE_HOVER_COLORS.video;

    // Format duration from ISO 8601 (PT15M30S) to readable format
    const formatDuration = (isoDuration?: string) => {
        if (!isoDuration) return null;
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return isoDuration;

        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;

        if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formattedDuration = formatDuration(duration);

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

            {/* Video-specific metadata */}
            {(views !== undefined || likes !== undefined || comments !== undefined || formattedDuration || channel) && (
                <CardContent>
                    <div className="space-y-2">
                        {channel && (
                            <div className="text-sm font-medium text-muted-foreground">
                                {channel}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                            {views !== undefined && (
                                <CardMetadataRow icon={Eye} value={views.toLocaleString()}/>
                            )}
                            {likes !== undefined && (
                                <CardMetadataRow icon={ThumbsUp} value={likes.toLocaleString()}/>
                            )}
                            {comments !== undefined && (
                                <CardMetadataRow icon={MessageSquare} value={comments.toLocaleString()}/>
                            )}
                            {formattedDuration && (
                                <CardMetadataRow icon={Clock} value={formattedDuration}/>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}

            <CardTags tags={tags}/>
        </BaseCardContainer>
    );
}
