"use client";

import Link from "next/link";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyRsvpedEvents } from "@/features/social/hooks/use-events";
import { MyEventCard } from "@/features/social/components/events/MyEventCard";

export default function MyEventsPage() {
  const { data: events, isLoading } = useMyRsvpedEvents(50); // Fetch more for list page

  return (
    <div className="container max-w-3xl mx-auto space-y-6 pb-12 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/feed/events"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">My Events</h1>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/feed/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {events?.length || 0} Events
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <MyEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-lg font-medium">No events found</p>
            <p className="text-sm text-muted-foreground mt-1">
              You haven't registered for any events yet.
            </p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/feed/events">Browse events</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
