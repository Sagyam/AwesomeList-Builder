import * as React from "react";
import {DollarSign, Star} from "lucide-react";
import {getTechIconClasses} from "@/lib/utils/tech-icons";

interface ResourceListItemProps {
  id: string;
  name: string;
  description: string;
  url: string;
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
  return (
    <a
      href={`/resources/${id}`}
      className="block group border-b border-border last:border-0 py-4 px-2 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold group-hover:text-primary transition-colors">
              {name}
            </span>

            {/* Status Indicators */}
            {featured && (
              <span
                className="inline-flex items-center text-yellow-600 dark:text-yellow-400"
                title="Featured"
              >
                ⭐
              </span>
            )}
            {trending && (
              <span
                className="inline-flex items-center text-green-600 dark:text-green-400"
                title="Trending"
              >
                📈
              </span>
            )}
            {archived && (
              <span
                className="inline-flex items-center text-red-600 dark:text-red-400"
                title="Archived"
              >
                📦
              </span>
            )}

            {/* Category Badge */}
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {category}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {techIcons.length > 0 && (
              <div className="flex items-center gap-1">
                {techIcons.map((iconClass, index) => (
                    <i key={index} className={`${iconClass} text-sm`} title={techList[index]}/>
                ))}
              </div>
            )}
            {stars !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 stroke-yellow-400"/>
                <span>{stars.toLocaleString()}</span>
              </div>
            )}
            {license && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5"/>
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
