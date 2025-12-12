import {BookOpen, Calendar, Star} from "lucide-react";
import {CardContent} from "@/components/ui/card";
import {getTypeIcon} from "@/lib/utils/type-icons";
import {TYPE_HOVER_COLORS} from "../constants";
import {BaseCardContainer} from "../primitives/BaseCardContainer";
import {CardMetadataRow} from "../primitives/CardMetadataRow";
import {CardTags} from "../primitives/CardTags";
import {ResourceCardHeader} from "../ResourceCardHeader";
import {ResourceCardMedia} from "../ResourceCardMedia";

export interface BookCardProps {
  id: string;
  name: string;
  description: string;
  image?: string;
  imageAlt?: string;
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
  archived?: boolean;
  // Book-specific metadata
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  rating?: number;
  categories?: string[];
}

/**
 * BookCard - Specialized card for book resources
 * Displays book-specific metadata like authors, publisher, rating
 */
export function BookCard({
  id,
  name,
  description,
  image,
  imageAlt,
  tags = [],
  featured = false,
  trending = false,
  archived = false,
  authors,
  publisher,
  publishedDate,
  pageCount,
  rating,
  categories,
}: BookCardProps) {
  const { icon: TypeIcon, label: typeLabel } = getTypeIcon("book");
  const typeHoverColor = TYPE_HOVER_COLORS.book;

  const formatPublishedDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.getFullYear();
    } catch {
      return dateStr;
    }
  };

  const year = formatPublishedDate(publishedDate);

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

      {/* Book-specific metadata */}
      <CardContent>
        <div className="space-y-2">
          {authors && authors.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">by {authors.join(", ")}</div>
          )}

          <div className="flex flex-wrap gap-4">
            {year && <CardMetadataRow icon={Calendar} value={year} />}
            {pageCount && <CardMetadataRow icon={BookOpen} value={`${pageCount} pages`} />}
            {rating && <CardMetadataRow icon={Star} value={`${rating.toFixed(1)}/5.0`} />}
          </div>

          {publisher && <div className="text-xs text-muted-foreground">{publisher}</div>}
        </div>
      </CardContent>

      <CardTags tags={tags} />
    </BaseCardContainer>
  );
}
