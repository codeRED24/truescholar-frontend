// Post Skeleton Component
// Loading placeholder for post cards

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PostSkeletonProps {
  className?: string;
}

export function PostSkeleton({ className }: PostSkeletonProps) {
  return (
    <div className={cn("p-4 space-y-4", className)}>
      {/* Author Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      {/* Media placeholder (sometimes) */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* Actions */}
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
