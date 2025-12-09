import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export function ResourceCardSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <Card className="overflow-hidden h-full">
      {/* Image Skeleton */}
      {withImage && <Skeleton className="aspect-video w-full" />}

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-3/4" />
            {/* Description Skeleton */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Category Badge Skeleton */}
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-4">
          {/* Language Skeleton */}
          <Skeleton className="h-4 w-16" />
          {/* Stars Skeleton */}
          <Skeleton className="h-4 w-12" />
          {/* License Skeleton */}
          <Skeleton className="h-4 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}
