import {Archive, Scale, Star, TrendingUp} from "lucide-react";
import * as React from "react";
import {RegistryBadge} from "@/components/RegistryBadge";
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {getTechIconClasses} from "@/lib/utils/tech-icons";
import {getTypeIcon} from "@/lib/utils/type-icons";
import type {Types} from "@/schema/ts/types";

type Registry = "npm" | "pypi" | "cargo" | "rubygems" | "maven" | "nuget" | "go" | "packagist";

interface ResourceCardProps {
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

  // Unique hover colors for each type
  const typeHoverColors: Record<Types, string> = {
    library: "group-hover:bg-blue-500 group-hover:text-white",
    article: "group-hover:bg-purple-500 group-hover:text-white",
    video: "group-hover:bg-red-500 group-hover:text-white",
    book: "group-hover:bg-amber-500 group-hover:text-white",
    course: "group-hover:bg-green-500 group-hover:text-white",
    tool: "group-hover:bg-orange-500 group-hover:text-white",
    paper: "group-hover:bg-cyan-500 group-hover:text-white",
    podcast: "group-hover:bg-pink-500 group-hover:text-white",
    documentation: "group-hover:bg-indigo-500 group-hover:text-white",
    repository: "group-hover:bg-emerald-500 group-hover:text-white",
    community: "group-hover:bg-rose-500 group-hover:text-white",
    newsletter: "group-hover:bg-sky-500 group-hover:text-white",
    cheatsheet: "group-hover:bg-lime-500 group-hover:text-white",
    conference: "group-hover:bg-violet-500 group-hover:text-white",
    certification: "group-hover:bg-yellow-500 group-hover:text-white",
  };

  return (
    <a href={`/resources/${id}`} className="block group">
      <Card
          className="transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20 overflow-hidden h-full">
        {/* Image Section */}
        {image && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img
              src={image}
              alt={imageAlt || name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 brightness-95 group-hover:brightness-110"
            />
            {/* Status Badges Overlay */}
            <div className="absolute top-2 right-2 flex gap-2">
              <TooltipProvider>
                {featured && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center rounded-full bg-yellow-500 p-1.5 text-white shadow-sm cursor-help">
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Featured</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {trending && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center rounded-full bg-green-500 p-1.5 text-white shadow-sm cursor-help">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Trending</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {archived && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center rounded-full bg-red-500 p-1.5 text-white shadow-sm cursor-help">
                        <Archive className="h-3.5 w-3.5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archived</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="group-hover:text-primary transition-colors">{name}</CardTitle>
                {/* Status badges when no image */}
                {!image && (featured || trending || archived) && (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      {featured && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center rounded-full bg-yellow-500/10 p-1 text-yellow-600 dark:text-yellow-400 cursor-help">
                              <Star className="h-3 w-3 fill-current" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Featured</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {trending && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-1 text-green-600 dark:text-green-400 cursor-help">
                              <TrendingUp className="h-3 w-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Trending</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {archived && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center justify-center rounded-full bg-red-500/10 p-1 text-red-600 dark:text-red-400 cursor-help">
                              <Archive className="h-3 w-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Archived</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-3">{description}</CardDescription>
            </div>
            <CardAction>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                        className={`inline-flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary transition-all duration-300 cursor-help ${typeHoverColors[type]}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{typeLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardAction>
          </div>
        </CardHeader>

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
                  <i key={index} className={`${iconClass} text-base`} title={techList[index]} />
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
      </Card>
    </a>
  );
}
