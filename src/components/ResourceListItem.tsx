import {Archive, Scale, Star, TrendingUp} from "lucide-react";
import * as React from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {getTechIconClasses} from "@/lib/utils/tech-icons";
import {getTypeIcon} from "@/lib/utils/type-icons";
import type {Types} from "@/schema/ts/types";

interface ResourceListItemProps {
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
  archived?: boolean;
  trending?: boolean;
  featured?: boolean;
}

export function ResourceListItem({
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
  archived = false,
  trending = false,
  featured = false,
}: ResourceListItemProps) {
  // Use languages array if available, otherwise fall back to single language
  const techList = languages.length > 0 ? languages : language ? [language] : [];
  const techIcons = getTechIconClasses(techList, 3);
  const { icon: TypeIcon, label: typeLabel } = getTypeIcon(type);

  return (
    <a href={`/resources/${id}`} className="block group">
      <div className="flex items-start gap-4 border border-border rounded-lg p-4 mb-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/30">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold group-hover:text-primary transition-colors">
              {name}
            </span>

            {/* Status Indicators */}
            <TooltipProvider>
              {featured && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center rounded-full bg-yellow-500/10 p-0.5 text-yellow-600 dark:text-yellow-400 cursor-help">
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
                    <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 p-0.5 text-green-600 dark:text-green-400 cursor-help">
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
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500/10 p-0.5 text-red-600 dark:text-red-400 cursor-help">
                      <Archive className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Archived</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            {/* Type Icon with Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-1 text-primary cursor-help">
                    <TypeIcon className="h-3.5 w-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{typeLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {techIcons.length > 0 && (
              <div className="flex items-center gap-1">
                {techIcons.map((iconClass, index) => (
                  <i key={index} className={`${iconClass} text-sm`} title={techList[index]} />
                ))}
              </div>
            )}
            {stars !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 stroke-yellow-400" />
                <span>{stars.toLocaleString()}</span>
              </div>
            )}
            {license && (
              <div className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                <span>{license}</span>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground/60">•</span>
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
