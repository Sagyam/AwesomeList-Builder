import {Card, CardContent} from "@/components/ui/card";
import {getTechIconClasses} from "@/lib/utils/tech-icons";
import {getTypeIcon} from "@/lib/utils/type-icons";
import type {Types} from "@/schema/ts/types";
import {TYPE_HOVER_COLORS} from "./constants";
import {ResourceCardFooter} from "./ResourceCardFooter";
import {ResourceCardHeader} from "./ResourceCardHeader";
import {ResourceCardMedia} from "./ResourceCardMedia";

type Registry = "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";

export interface ResourceCardProps {
  id: string;
  name: string;
  description: string;
  url: string;
  type: Types;
  category?: string;
  language?: string;
  languages?: string[];
  stars?: number;
  license?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  archived?: boolean;
  trending?: boolean;
  featured?: boolean;
  registry?: Registry;
  packageName?: string;
  lastReleaseVersion?: string;
  downloads?: string;
}

/**
 * ResourceCard component
 * Displays a resource with image/icon, metadata, and interactive elements
 */
export function ResourceCard({
  id,
  name,
  description,
  url,
  type,
  category = "Uncategorized",
  language,
  languages = [],
  stars,
  license,
  tags = [],
  image,
  imageAlt,
  archived = false,
  trending = false,
  featured = false,
  registry,
  packageName,
  lastReleaseVersion,
  downloads,
}: ResourceCardProps) {
  // Use languages array if available, otherwise fall back to single language
  const techList = languages.length > 0 ? languages : language ? [language] : [];
  const techIcons = getTechIconClasses(techList, 3);
  const { icon: TypeIcon, label: typeLabel } = getTypeIcon(type);
  const typeHoverColor = TYPE_HOVER_COLORS[type];

  // Determine the first tech icon for media placeholder
  const firstTechIcon = techIcons.length > 0 ? techIcons[0] : undefined;
  const firstTechName = techList.length > 0 ? techList[0] : undefined;

  return (
    <a href={`/resources/${id}`} className="block group">
      <Card className="transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 overflow-hidden h-full">
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

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>

        <ResourceCardFooter
          registry={registry}
          packageName={packageName}
          lastReleaseVersion={lastReleaseVersion}
          techIcons={techIcons}
          techList={techList}
          stars={stars}
          license={license}
        />
      </Card>
    </a>
  );
}
