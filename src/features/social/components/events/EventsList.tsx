"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useInfiniteEvents } from "../../hooks/use-events";
import { EventCard } from "./EventCard";
import { type EventQueryDto } from "../../types";

interface EventsListProps {
  filters: EventQueryDto;
}

export function EventsList({ filters }: EventsListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEvents(filters);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load events. Please try again.
      </div>
    );
  }

  const events = data?.pages.flatMap((page) => page.data) ?? [];

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
        <p className="text-lg font-medium">No events found</p>
        <p className="text-sm mt-1">Check back later or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div ref={ref} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
