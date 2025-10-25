
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Simplified skeleton component for individual reviews
export const ReviewSkeleton = () => (
  <Card className="gap-0 rounded-3xl bg-[#F6F6F7] pb-0 shadow-none">
    <div className="space-y-4 px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Review content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </Card>
);
