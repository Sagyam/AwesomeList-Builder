import {ResourceCardSkeleton} from "@/components/ResourceCardSkeleton";
import {ResourceListItemSkeleton} from "@/components/ResourceListItemSkeleton";

interface ResourceSkeletonsProps {
    count?: number;
    view?: "card" | "list";
    withImage?: boolean;
}

export function ResourceSkeletons({
                                      count = 6,
                                      view = "card",
                                      withImage = true
                                  }: ResourceSkeletonsProps) {
    if (view === "list") {
        return (
            <div className="space-y-0">
                {Array.from({length: count}).map((_, index) => (
                    <ResourceListItemSkeleton key={index}/>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: count}).map((_, index) => (
                <ResourceCardSkeleton key={index} withImage={withImage}/>
            ))}
        </div>
    );
}