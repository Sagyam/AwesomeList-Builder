import {Scale, Star} from "lucide-react";
import {RegistryBadge} from "@/components/RegistryBadge";
import {CardFooter} from "@/components/ui/card";
import {getTechIconClasses} from "@/lib/utils/tech-icons";
import {getTypeIcon} from "@/lib/utils/type-icons";
import type {Types} from "@/schema/ts/types";
import {TYPE_HOVER_COLORS} from "../constants";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardTags} from "../primitives/CardTags";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";

type Registry = "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";

export interface GenericCardProps {
  id: string;
  name: string;
  description: string;
  type: Types;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;
  // Generic metadata that applies to many types
  language?: string;
  languages?: string[];
  stars?: number;
  license?: string;
  registry?: Registry;
  packageName?: string;
  lastReleaseVersion?: string;
  downloads?: string;
}

/**
 * GenericCard - Default card for resource types without specialized cards
 * Displays common metadata like stars, license, registry info
 */
export function GenericCard({
  id,
  name,
  description,
  type,
  image,
  imageAlt,
  tags = [],
  featured = false,
  trending = false,
  archived = false,
  language,
  languages = [],
  stars,
  license,
  registry,
  packageName,
  lastReleaseVersion,
  downloads,
}: GenericCardProps) {
  const techList = languages.length > 0 ? languages : language ? [language] : [];
  const techIcons = getTechIconClasses(techList, 3);
  const { icon: TypeIcon, label: typeLabel } = getTypeIcon(type);
  const typeHoverColor = TYPE_HOVER_COLORS[type];

  const firstTechIcon = techIcons.length > 0 ? techIcons[0] : undefined;
  const firstTechName = techList.length > 0 ? techList[0] : undefined;

  return (
    <BaseCardContainer id={id}>
      <ResourceCardMedia
        image={image}
        imageAlt={imageAlt}
        name={name}
        techIcon={firstTechIcon}
        techName={firstTechName}
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
        hasImage={!!image || !!firstTechIcon}
        featured={featured}
        trending={trending}
        archived={archived}
      />

      <CardTags tags={tags} />

      {/* Footer with tech stack, registry, stars, license */}
      <CardFooter className="justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {registry && (
            <RegistryBadge
              registry={registry}
              packageName={packageName}
              lastReleaseVersion={lastReleaseVersion}
            />
          )}
          {techIcons.length > 0 && (
            <div className="flex items-center gap-1.5">
              {techIcons.map((iconClass, index) => (
                <i
                  key={`${techList[index]}-${index}`}
                  className={`${iconClass} text-base`}
                  title={techList[index]}
                />
              ))}
            </div>
          )}
          {stars !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
              <span>{stars.toLocaleString()}</span>
            </div>
          )}
          {license && (
            <div className="flex items-center gap-1">
              <Scale className="h-4 w-4" />
              <span>{license}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </BaseCardContainer>
  );
}
