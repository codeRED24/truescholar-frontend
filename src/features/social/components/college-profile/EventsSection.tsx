"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "../../hooks/use-events";
import { useCollegeMemberships } from "../../hooks/use-memberships";
import { EventCardCompact } from "../events/EventCardCompact";
import { getCollegeProfilePath } from "../../utils/author-navigation";

interface EventsSectionProps {
  slugId: string;
}

export function EventsSection({ slugId }: EventsSectionProps) {
  // Parse college ID from slug (e.g., "college-name-123" -> 123)
  const collegeId = parseInt(slugId.split("-").pop() || "0");

  // Check admin status
  const { data: memberships } = useCollegeMemberships();
  const isAdmin = memberships?.some(
    (m) =>
      m.collegeId === collegeId &&
      ["admin", "owner", "college_admin"].includes(m.role)
  );

  // Memoize date to prevent infinite refetching
  const now = useMemo(() => new Date().toISOString(), []);

  // Fetch upcoming events
  // endAfter: now ensures we show events that haven't ended yet (upcoming + ongoing)
  const { data, isLoading } = useEvents({
    organizerCollegeId: collegeId,
    endAfter: now,
    limit: 4,
  });

  const events = data?.data || [];
  const hasEvents = events.length > 0;
  const eventsPath = getCollegeProfilePath(slugId, "events");

  // Hide section for non-admins if no events
  if (!isLoading && !hasEvents && !isAdmin) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Events</CardTitle>
        {isAdmin && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/feed/events/create?collegeId=${collegeId}`}>
              <Plus className="h-4 w-4 mr-1" /> Create Event
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : hasEvents ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {events.map((event) => (
                <EventCardCompact key={event.id} event={event} />
              ))}
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={eventsPath}>Show all events</Link>
            </Button>
          </>
        ) : (
          // Admin empty state
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p className="mb-4">No upcoming events scheduled</p>
            <Button asChild>
              <Link href={`/feed/events/create?collegeId=${collegeId}`}>
                Create your first event
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
