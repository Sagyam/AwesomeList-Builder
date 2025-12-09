import * as React from "react";
import {LayoutToggle} from "@/components/LayoutToggle";
import {ResourceCard} from "@/components/ResourceCard";
import {ResourceListItem} from "@/components/ResourceListItem";

interface Resource {
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

interface ResourcesContainerProps {
  resources: Resource[];
}

export function ResourcesContainer({ resources }: ResourcesContainerProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  return (
    <div>
      {/* View Toggle */}
      <div className="mb-6 flex justify-end">
        <LayoutToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="border rounded-lg overflow-hidden bg-card">
          {resources.map((resource) => (
            <ResourceListItem key={resource.id} {...resource} />
          ))}
        </div>
      )}

      {resources.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
            <svg
              className="h-8 w-8 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20" />
              <path d="m19 9-7 7-7-7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new resources.
          </p>
        </div>
      )}
    </div>
  );
}
