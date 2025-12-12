import {BookOpen, CheckCircle2, Clock, Code2, Search, ExternalLink, Github} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface DocumentationCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Documentation-specific metadata
    project?: string;
    version?: string;
    format?: string;
    searchable?: boolean;
    interactive?: boolean;
    lastUpdated?: string;
    officialDocs?: boolean;
    languages?: string[];
    repository?: string;
    documentationUrl?: string;
}

/**
 * DocumentationCard - Specialized card for documentation
 * Displays documentation-specific metadata like version, format, features
 */
export function DocumentationCard({
                                      id,
                                      name,
                                      description,
                                      image,
                                      imageAlt,
                                      tags = [],
                                      featured = false,
                                      trending = false,
                                      archived = false,
                                      project,
                                      version,
                                      format,
                                      searchable,
                                      interactive,
                                      lastUpdated,
                                      officialDocs,
                                      languages,
                                      repository,
                                      documentationUrl,
                                  }: DocumentationCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("documentation");
    const typeHoverColor = TYPE_HOVER_COLORS.documentation || "hover:text-amber-600";

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffDays = Math.floor(
                (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 0) return "Today";
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 30) return `${diffDays} days ago`;
            if (diffDays < 365) {
                const months = Math.floor(diffDays / 30);
                return `${months} month${months > 1 ? "s" : ""} ago`;
            }
            const years = Math.floor(diffDays / 365);
            return `${years} year${years > 1 ? "s" : ""} ago`;
        } catch {
            return dateStr;
        }
    };

    const lastUpdatedText = formatDate(lastUpdated);

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

            {/* Documentation-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        {project && (
                            <span className="font-medium text-muted-foreground">
                                {project}
                            </span>
                        )}
                        {version && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                                v{version}
                            </span>
                        )}
                        {officialDocs && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" title="Official Documentation"/>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {format && (
                            <CardMetadataRow icon={BookOpen} value={format}/>
                        )}
                        {lastUpdatedText && (
                            <CardMetadataRow icon={Clock} value={lastUpdatedText}/>
                        )}
                    </div>

                    {(searchable || interactive) && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {searchable && (
                                <span className="px-2 py-1 bg-muted rounded flex items-center gap-1">
                                    <Search className="h-3 w-3"/> Searchable
                                </span>
                            )}
                            {interactive && (
                                <span className="px-2 py-1 bg-muted rounded flex items-center gap-1">
                                    <Code2 className="h-3 w-3"/> Interactive
                                </span>
                            )}
                        </div>
                    )}

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

            {/* Footer with documentation links */}
            {(repository || documentationUrl) && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground border-t">
                    {repository && (
                        <a
                            href={repository}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Github className="h-4 w-4"/>
                            <span>Repository</span>
                        </a>
                    )}
                    {documentationUrl && (
                        <a
                            href={documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-4 w-4"/>
                            <span>View Docs</span>
                        </a>
                    )}
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
