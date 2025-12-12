import {Activity, CheckCircle2, ExternalLink, Lock, MessageSquare, Users} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface CommunityCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Community-specific metadata
    platform?: string;
    members?: number;
    onlineMembers?: number;
    activity?: "low" | "medium" | "high" | "very-high";
    inviteOnly?: boolean;
    verified?: boolean;
    languages?: string[];
    communityUrl?: string;
}

/**
 * CommunityCard - Specialized card for communities
 * Displays community-specific metadata like platform, members, activity level
 */
export function CommunityCard({
                                  id,
                                  name,
                                  description,
                                  image,
                                  imageAlt,
                                  tags = [],
                                  featured = false,
                                  trending = false,
                                  archived = false,
                                  platform,
                                  members,
                                  onlineMembers,
                                  activity,
                                  inviteOnly,
                                  verified,
                                  languages,
                                  communityUrl,
                              }: CommunityCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("community");
    const typeHoverColor = TYPE_HOVER_COLORS.community || "hover:text-blue-600";

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const getActivityColor = (level?: string) => {
        switch (level) {
            case "very-high":
                return "text-green-600";
            case "high":
                return "text-green-500";
            case "medium":
                return "text-yellow-500";
            case "low":
                return "text-gray-500";
            default:
                return "text-muted-foreground";
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

            {/* Community-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {platform && (
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MessageSquare className="h-3 w-3"/>
                            {platform}
                            {verified && <CheckCircle2 className="h-3 w-3 text-blue-500"/>}
                            {inviteOnly && <Lock className="h-3 w-3"/>}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {members !== undefined && (
                            <CardMetadataRow
                                icon={Users}
                                value={`${formatNumber(members)} members`}
                            />
                        )}
                        {onlineMembers !== undefined && (
                            <CardMetadataRow
                                value={`${formatNumber(onlineMembers)} online`}
                            />
                        )}
                        {activity && (
                            <div className="flex items-center gap-2 text-sm">
                                <Activity className={`h-4 w-4 ${getActivityColor(activity)}`}/>
                                <span className="capitalize">{activity.replace("-", " ")}</span>
                            </div>
                        )}
                    </div>

                    {languages && languages.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {languages.slice(0, 3).map((lang) => (
                                <span key={lang} className="px-2 py-1 bg-muted rounded">
                                    {lang}
                                </span>
                            ))}
                            {languages.length > 3 && (
                                <span className="px-2 py-1 bg-muted rounded">
                                    +{languages.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with join community link */}
            {communityUrl && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground border-t">
                    <a
                        href={communityUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-4 w-4"/>
                        <span>Join Community</span>
                    </a>
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
