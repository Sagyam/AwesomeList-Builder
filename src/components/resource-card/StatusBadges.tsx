import {Archive, Star, TrendingUp} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

interface StatusBadgesProps {
    featured?: boolean;
    trending?: boolean;
    archived?: boolean;
    variant?: "overlay" | "inline";
}

/**
 * Status badges for featured, trending, and archived resources
 * Supports two variants:
 * - overlay: Solid background badges for overlaying on images
 * - inline: Subtle background badges for inline display next to titles
 */
export function StatusBadges({
                                 featured = false,
                                 trending = false,
                                 archived = false,
                                 variant = "overlay",
                             }: StatusBadgesProps) {
    const hasAnyBadge = featured || trending || archived;

    if (!hasAnyBadge) {
        return null;
    }

    const isOverlay = variant === "overlay";

    return (
        <div className={`flex ${isOverlay ? "gap-2" : "gap-1"}`}>
            <TooltipProvider>
                {featured && (
                    <Tooltip>
                        <TooltipTrigger asChild>
              <span
                  className={`inline-flex items-center justify-center rounded-full cursor-help ${
                      isOverlay
                          ? "bg-yellow-500 p-1.5 text-white shadow-sm"
                          : "bg-yellow-500/10 p-1 text-yellow-600 dark:text-yellow-400"
                  }`}
              >
                <Star className={`fill-current ${isOverlay ? "h-3.5 w-3.5" : "h-3 w-3"}`}/>
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
              <span
                  className={`inline-flex items-center justify-center rounded-full cursor-help ${
                      isOverlay
                          ? "bg-green-500 p-1.5 text-white shadow-sm"
                          : "bg-green-500/10 p-1 text-green-600 dark:text-green-400"
                  }`}
              >
                <TrendingUp className={isOverlay ? "h-3.5 w-3.5" : "h-3 w-3"}/>
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
              <span
                  className={`inline-flex items-center justify-center rounded-full cursor-help ${
                      isOverlay
                          ? "bg-red-500 p-1.5 text-white shadow-sm"
                          : "bg-red-500/10 p-1 text-red-600 dark:text-red-400"
                  }`}
              >
                <Archive className={isOverlay ? "h-3.5 w-3.5" : "h-3 w-3"}/>
              </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Archived</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
        </div>
    );
}
