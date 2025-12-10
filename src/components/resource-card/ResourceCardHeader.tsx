import type {LucideIcon} from "lucide-react";
import {CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {StatusBadges} from "./StatusBadges";

interface ResourceCardHeaderProps {
  name: string;
  description: string;
  TypeIcon: LucideIcon;
  typeLabel: string;
  typeHoverColor: string;
  hasImage: boolean;
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;
}

/**
 * Header section for ResourceCard
 * Displays title, description, type icon, and inline status badges (when no image)
 */
export function ResourceCardHeader({
  name,
  description,
  TypeIcon,
  typeLabel,
  typeHoverColor,
  hasImage,
  featured = false,
  trending = false,
  archived = false,
}: ResourceCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="group-hover:text-primary transition-colors">{name}</CardTitle>
            {/* Status badges when no image */}
            {!hasImage && (
              <StatusBadges
                featured={featured}
                trending={trending}
                archived={archived}
                variant="inline"
              />
            )}
          </div>
          <CardDescription className="line-clamp-3">{description}</CardDescription>
        </div>
        <CardAction>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary transition-all duration-300 cursor-help ${typeHoverColor}`}
                >
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
  );
}
