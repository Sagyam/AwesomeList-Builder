import {Award, Building2, Calendar, Clock, DollarSign, ExternalLink, GraduationCap} from "lucide-react";
import {CardContent, CardFooter} from "@/components/ui/card";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";

export interface CertificationCardProps {
    id: string;
    name: string;
    description: string;
    image?: string;
    imageAlt?: string;
    tags?: string[];
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    // Certification-specific metadata
    provider?: string;
    providerUrl?: string;
    examCode?: string;
    duration?: string; // Validity duration
    examDuration?: string;
    cost?: string;
    format?: string;
    difficultyLevel?: string;
    certificationUrl?: string;
}

/**
 * CertificationCard - Specialized card for certifications
 * Displays certification-specific metadata like provider, exam code, cost
 */
export function CertificationCard({
                                      id,
                                      name,
                                      description,
                                      image,
                                      imageAlt,
                                      tags = [],
                                      featured = false,
                                      trending = false,
                                      archived = false,
                                      provider,
                                      providerUrl,
                                      examCode,
                                      duration,
                                      examDuration,
                                      cost,
                                      format,
                                      difficultyLevel,
                                      certificationUrl,
                                  }: CertificationCardProps) {
    const {icon: TypeIcon, label: typeLabel} = getTypeIcon("certification");
    const typeHoverColor = TYPE_HOVER_COLORS.certification || "hover:text-purple-600";

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

            {/* Certification-specific metadata */}
            <CardContent>
                <div className="space-y-2">
                    {provider && (
                        <div className="text-sm font-medium text-muted-foreground">
                            {provider}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {examCode && (
                            <CardMetadataRow icon={Award} value={examCode}/>
                        )}
                        {duration && (
                            <CardMetadataRow icon={Calendar} value={`Valid: ${duration}`}/>
                        )}
                        {examDuration && (
                            <CardMetadataRow icon={Clock} value={examDuration}/>
                        )}
                        {cost && (
                            <CardMetadataRow icon={DollarSign} value={cost}/>
                        )}
                    </div>

                    {(format || difficultyLevel) && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {format && <span className="px-2 py-1 bg-muted rounded">{format}</span>}
                            {difficultyLevel && (
                                <span className="px-2 py-1 bg-muted rounded">{difficultyLevel}</span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardTags tags={tags}/>

            {/* Footer with certification provider link */}
            {(providerUrl || certificationUrl) && (
                <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground border-t">
                    {providerUrl && (
                        <a
                            href={providerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Building2 className="h-4 w-4"/>
                            <span>Provider</span>
                        </a>
                    )}
                    {certificationUrl && (
                        <a
                            href={certificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <GraduationCap className="h-4 w-4"/>
                            <span>Learn More</span>
                        </a>
                    )}
                </CardFooter>
            )}
        </BaseCardContainer>
    );
}
