import {CardContent} from "@/components/ui/card";

interface CardTagsProps {
  tags: string[];
}

/**
 * Shared tags component for resource cards
 */
export function CardTags({ tags }: CardTagsProps) {
  if (tags.length === 0) return null;

  return (
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
  );
}
