import * as React from "react";
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";

interface ResourceCardProps {
  id: string;
  name: string;
  description: string;
  url: string;
  category?: string;
  language?: string;
  stars?: number;
  license?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
  archived?: boolean;
  trending?: boolean;
  featured?: boolean;
}

export function ResourceCard({
  id,
  name,
  description,
  url,
  category = "Uncategorized",
  language,
  stars,
  license,
  tags = [],
  image,
  imageAlt,
  archived = false,
  trending = false,
  featured = false,
}: ResourceCardProps) {
  return (
    <a href={`/resources/${id}`} className="block group">
      <Card className="transition-all hover:shadow-lg overflow-hidden h-full">
        {/* Image Section */}
        {image && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <img
              src={image}
              alt={imageAlt || name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Status Badges Overlay */}
            <div className="absolute top-2 right-2 flex gap-2">
              {featured && (
                <span className="inline-flex items-center rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                  ⭐ Featured
                </span>
              )}
              {trending && (
                <span className="inline-flex items-center rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                  📈 Trending
                </span>
              )}
              {archived && (
                <span className="inline-flex items-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                  📦 Archived
                </span>
              )}
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
                    {featured && (
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                        ⭐
                      </span>
                    )}
                    {trending && (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                        📈
                      </span>
                    )}
                    {archived && (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        📦
                      </span>
                    )}
                  </div>
                )}
              </div>
              <CardDescription className="line-clamp-2">{description}</CardDescription>
            </div>
            <CardAction>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {category}
              </span>
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {language && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>{language}</span>
              </div>
            )}
            {stars !== undefined && (
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 fill-yellow-400 stroke-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>{stars.toLocaleString()}</span>
              </div>
            )}
            {license && (
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>{license}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </a>
  );
}
