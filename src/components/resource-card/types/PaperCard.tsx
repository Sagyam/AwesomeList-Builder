import {Award, Calendar, ExternalLink, FileText, Users} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface PaperCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Paper-specific metadata
    authors?: string[];
    published?: string;
    venue?: string; // Conference or Journal
    citations?: number;
    field?: string;
    arxivId?: string;
    pdfUrl?: string;
}

/**
 * PaperCard - Specialized card for academic papers
 * Displays paper-specific metadata like authors, venue, citations
 */
export function PaperCard({
                              id,
                              name,
                              description,
                              image,
                              imageAlt,
                              tags = [],
                              featured = false,
                              trending = false,
                              archived = false,
                              authors,
                              published,
                              venue,
                              citations,
                              field,
                              arxivId,
                              pdfUrl,
                          }: PaperCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("paper");
    const typeHoverColor = TYPE_HOVER_COLORS.paper;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.getFullYear();
        } catch {
            return dateStr;
        }
    };

    const year = formatDate(published);

    // Format citations count (e.g., 85000 -> 85K)
    const formatCitations = (count?: number) => {
        if (!count) return null;
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    const citationCount = formatCitations(citations);

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

            {/* Paper-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {authors && authors.length > 0 && (
                        <div className="text-sm font-medium text-muted-foreground">
                            {authors.length === 1
                                ? authors[0]
                                : `${authors[0]} et al. (${authors.length} authors)`}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {venue && (
                            <CardMetadataRow icon={Award} value={venue}/>
                        )}
                        {year && (
                            <CardMetadataRow icon={Calendar} value={year}/>
                        )}
                        {citationCount && (
                            <CardMetadataRow
                                icon={Users}
                                value={`${citationCount} citations`}
                            />
                        )}
                    </div>

                    {field && (
                        <div className="text-xs text-muted-foreground">
                            {field}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with PDF/arXiv links */}
            {(arxivId || pdfUrl) && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                    {arxivId && (
                        <a
                            href={`https://arxiv.org/abs/${arxivId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FileText className="h-4 w-4"/>
                            <span>arXiv:{arxivId}</span>
                        </a>
                    )}
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-4 w-4"/>
                            <span>PDF</span>
                        </a>
                    )}
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
