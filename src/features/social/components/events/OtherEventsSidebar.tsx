"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRandomEvents } from "../../hooks/use-events";
import { EventImage } from "./EventImage";
import { Loader2 } from "lucide-react";

export function OtherEventsSidebar() {
  const { data: events, isLoading } = useRandomEvents(3);

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <h3 className="font-bold text-lg">Host an event</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Host an event and invite your networks to join you.
          </p>
          <Button className="w-full rounded-full" asChild>
            <Link href="/feed/events/create">Create an event</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <h3 className="font-bold text-lg">Other events for you</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Link key={event.id} href={`/feed/events/${event.id}`} className="flex gap-3 group">
                  <div className="w-20 h-14 flex-shrink-0">
                    <EventImage src={event.mediaUrl} alt={event.title} className="rounded-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {event.location || "Online"}
                    </p>
                  </div>
                </Link>
              ))}
              <Button variant="link" className="w-full text-muted-foreground" asChild>
                <Link href="/feed/events">Show all</Link>
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No upcoming events found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
