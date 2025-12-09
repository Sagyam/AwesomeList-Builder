import {Skeleton} from "@/components/ui/skeleton";

export function ResourceListItemSkeleton() {
    return (
        <div className="border border-border rounded-lg p-4 mb-3">
            <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                    {/* Title Row with badges */}
                    <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-5 w-48"/>
                        <Skeleton className="h-6 w-6 rounded-full"/>
                        <Skeleton className="h-6 w-6 rounded-full"/>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 mb-2">
                        <Skeleton className="h-4 w-full"/>
                        <Skeleton className="h-4 w-3/4"/>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Tech icons */}
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-4 w-4 rounded"/>
                            <Skeleton className="h-4 w-4 rounded"/>
                        </div>
                        {/* Stars */}
                        <Skeleton className="h-3 w-12"/>
                        {/* License */}
                        <Skeleton className="h-3 w-16"/>
                        {/* Tags */}
                        <Skeleton className="h-5 w-16 rounded"/>
                        <Skeleton className="h-5 w-20 rounded"/>
                        <Skeleton className="h-5 w-14 rounded"/>
                    </div>
                </div>
            </div>
        </div>
    );
}