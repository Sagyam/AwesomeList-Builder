import {StatusBadges} from "./StatusBadges";

interface ResourceCardMediaProps {
  image?: string;
  imageAlt?: string;
  name: string;
  techIcon?: string;
  techName?: string;
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;
}

/**
 * Media section for ResourceCard
 * Displays either an image or a tech icon placeholder
 * Includes status badges overlay
 */
export function ResourceCardMedia({
  image,
  imageAlt,
  name,
  techIcon,
  techName,
  featured = false,
  trending = false,
  archived = false,
}: ResourceCardMediaProps) {
  // Don't render anything if there's no image and no tech icon
  if (!image && !techIcon) {
    return null;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
      {image ? (
        <img
          src={image}
          alt={imageAlt || name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 brightness-95 group-hover:brightness-110"
        />
      ) : techIcon ? (
        <div className="h-full w-full flex items-center justify-center">
          <i
            className={`${techIcon} text-[6rem] opacity-30 group-hover:opacity-40 transition-opacity duration-500`}
            title={techName}
          />
        </div>
      ) : null}

      {/* Status Badges Overlay */}
      <div className="absolute top-2 right-2">
        <StatusBadges
          featured={featured}
          trending={trending}
          archived={archived}
          variant="overlay"
        />
      </div>
    </div>
  );
}
