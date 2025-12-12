import {Download, FileText, Printer, User} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface CheatsheetCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Cheatsheet-specific metadata
    author?: string;
    subject?: string;
    format?: string;
    pages?: number;
    downloadUrl?: string;
    printable?: boolean;
    interactive?: boolean;
    version?: string;
}

/**
 * CheatsheetCard - Specialized card for cheatsheets
 * Displays cheatsheet-specific metadata like format, pages, download link
 */
export function CheatsheetCard({
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
                                   subject,
                                   format,
                                   pages,
                                   downloadUrl,
                                   printable,
                                   interactive,
                                   version,
                               }: CheatsheetCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("cheatsheet");
    const typeHoverColor = TYPE_HOVER_COLORS.cheatsheet || "hover:text-teal-600";

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

            {/* Cheatsheet-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {author && (
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <User className="h-3 w-3"/>
                            {author}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {format && (
                            <CardMetadataRow icon={FileText} value={format}/>
                        )}
                        {pages && (
                            <CardMetadataRow value={`${pages} page${pages > 1 ? 's' : ''}`}/>
                        )}
                        {version && (
                            <CardMetadataRow label="v" value={version}/>
                        )}
                    </div>

                    {(printable || interactive) && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {printable && <span className="px-2 py-1 bg-muted rounded flex items-center gap-1">
                                <Printer className="h-3 w-3"/> Printable
                            </span>}
                            {interactive && (
                                <span className="px-2 py-1 bg-muted rounded">Interactive</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with download link */}
            {downloadUrl && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download className="h-4 w-4"/>
                        <span>Download</span>
                    </a>
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
