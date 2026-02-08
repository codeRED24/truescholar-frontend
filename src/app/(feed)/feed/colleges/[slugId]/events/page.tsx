"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useInfiniteEvents } from "@/features/social/hooks/use-events";
import { useCollegeMemberships } from "@/features/social/hooks/use-memberships";
import { EventCard } from "@/features/social/components/events/EventCard";

export default function CollegeEventsPage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const collegeId = parseInt(slugId.split("-").pop() || "0");

  const { data: memberships } = useCollegeMemberships();
  const isAdmin = memberships?.some(
    (m) =>
      m.collegeId === collegeId &&
      ["admin", "owner", "college_admin"].includes(m.role)
  );

  // Memoize date to prevent infinite refetching in child components
  const now = useMemo(() => new Date().toISOString(), []);

  return (
    <div className="space-y-8 pb-12">
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button asChild>
            <Link href={`/feed/events/create?collegeId=${collegeId}`}>
              <Plus className="h-4 w-4 mr-1" /> Create Event
            </Link>
          </Button>
        </div>
      )}

      <UpcomingEventsSection collegeId={collegeId} now={now} />

      <Separator />

      <PastEventsSection collegeId={collegeId} now={now} />
    </div>
  );
}

function UpcomingEventsSection({ collegeId, now }: { collegeId: number; now: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteEvents({
    organizerCollegeId: collegeId,
    endAfter: now, // Upcoming & Ongoing
    // Default sort is ascending for upcoming usually?
    // Backend default sort needs checking, usually created DESC
    // TODO: Verify if backend sorts by startTime ASC for upcoming. 
    // Assuming backend handles sort based on filter or default.
  });

  const events = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto my-12" />;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        No upcoming events
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Upcoming & Ongoing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Load more upcoming events"
          )}
        </Button>
      )}
    </div>
  );
}

function PastEventsSection({ collegeId, now }: { collegeId: number; now: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteEvents({
    organizerCollegeId: collegeId,
    endBefore: now, // Past
  });

  const events = data?.pages.flatMap((page) => page.data) || [];

  if (isLoading) return null; // Don't show loader for past section initially to avoid clutter
  if (events.length === 0) return null; // Don't show section if no past events

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-muted-foreground">Past Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80 hover:opacity-100 transition-opacity">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Load more past events"
          )}
        </Button>
      )}
    </div>
  );
}
