import {Code2, DollarSign, Download, Monitor, Package} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface ToolCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Tool-specific metadata
    developer?: string;
    version?: string;
    platforms?: string[];
    pricing?: string;
    isOpenSource?: boolean;
    license?: string;
    category?: string;
    downloadUrl?: string;
}

/**
 * ToolCard - Specialized card for tools
 * Displays tool-specific metadata like platforms, pricing, version
 */
export function ToolCard({
                             id,
                             name,
                             description,
                             image,
                             imageAlt,
                             tags = [],
                             featured = false,
                             trending = false,
                             archived = false,
                             developer,
                             version,
                             platforms,
                             pricing,
                             isOpenSource,
                             license,
                             category,
                             downloadUrl,
                         }: ToolCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("tool");
    const typeHoverColor = TYPE_HOVER_COLORS.tool || "hover:text-cyan-600";

    const getPricingColor = (pricingType?: string) => {
        const type = pricingType?.toLowerCase();
        if (!type) return "bg-gray-100 text-gray-700";
        if (type.includes("free") || type.includes("open source"))
            return "bg-green-100 text-green-700";
        if (type.includes("freemium")) return "bg-blue-100 text-blue-700";
        if (type.includes("paid")) return "bg-orange-100 text-orange-700";
        return "bg-gray-100 text-gray-700";
    };

    const pricingColor = getPricingColor(pricing);

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

            {/* Tool-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        {developer && (
                            <span className="font-medium text-muted-foreground">
                                {developer}
                            </span>
                        )}
                        {version && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                                v{version}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {category && (
                            <CardMetadataRow icon={Package} value={category}/>
                        )}
                        {license && (
                            <CardMetadataRow icon={Code2} value={license}/>
                        )}
                    </div>

                    {platforms && platforms.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Monitor className="h-4 w-4"/>
                            <div className="flex flex-wrap gap-1">
                                {platforms.slice(0, 3).map((platform, idx) => (
                                    <span key={platform}>
                                        {platform}
                                        {idx < Math.min(platforms.length - 1, 2) && ","}
                                    </span>
                                ))}
                                {platforms.length > 3 && (
                                    <span>+{platforms.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {pricing && (
                            <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${pricingColor}`}
                            >
                                <DollarSign className="h-3 w-3"/>
                                {pricing}
                            </span>
                        )}
                        {isOpenSource && (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                <Code2 className="h-3 w-3"/>
                                Open Source
                            </span>
                        )}
                    </div>
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
