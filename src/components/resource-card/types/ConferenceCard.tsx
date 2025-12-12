import {Calendar, MapPin, Users, Video} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface ConferenceCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Conference-specific metadata
    organizer?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    virtual?: boolean;
    hybrid?: boolean;
    attendees?: number;
    registrationUrl?: string;
}

/**
 * ConferenceCard - Specialized card for conferences
 * Displays conference-specific metadata like dates, location, format
 */
export function ConferenceCard({
                                   id,
                                   name,
                                   description,
                                   image,
                                   imageAlt,
                                   tags = [],
                                   featured = false,
                                   trending = false,
                                   archived = false,
                                   organizer,
                                   startDate,
                                   endDate,
                                   location,
                                   virtual,
                                   hybrid,
                                   attendees,
                                   registrationUrl,
                               }: ConferenceCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("conference");
    const typeHoverColor = TYPE_HOVER_COLORS.conference || "hover:text-indigo-600";

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateRange = () => {
        if (!startDate) return null;
        const start = formatDate(startDate);
        if (!endDate || startDate === endDate) return start;
        const end = formatDate(endDate);
        return `${start} - ${end}`;
    };

    const formatAttendees = (count?: number) => {
        if (!count) return null;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const dateRange = formatDateRange();
    const attendeeCount = formatAttendees(attendees);

    const getFormatBadge = () => {
        if (hybrid) return {text: "Hybrid", icon: Video, color: "bg-purple-100 text-purple-700"};
        if (virtual) return {text: "Virtual", icon: Video, color: "bg-blue-100 text-blue-700"};
        return {text: "In-Person", icon: MapPin, color: "bg-green-100 text-green-700"};
    };

    const formatBadge = getFormatBadge();

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

            {/* Conference-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {organizer && (
                        <div className="text-sm font-medium text-muted-foreground">
                            {organizer}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {dateRange && (
                            <CardMetadataRow icon={Calendar} value={dateRange}/>
                        )}
                        {location && (
                            <CardMetadataRow icon={MapPin} value={location}/>
                        )}
                        {attendeeCount && (
                            <CardMetadataRow
                                icon={Users}
                                value={`${attendeeCount} attendees`}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${formatBadge.color}`}
                        >
                            <formatBadge.icon className="h-3 w-3"/>
                            {formatBadge.text}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with registration link */}
            {registrationUrl && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a
                        href={registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Calendar className="h-4 w-4"/>
                        <span>Register</span>
                    </a>
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
