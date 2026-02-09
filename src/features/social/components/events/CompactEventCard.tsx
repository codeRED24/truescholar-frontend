"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Event } from "../../types";
import { EventImage } from "./EventImage";
import { formatEventDate } from "../../utils/event-helpers";

interface CompactEventCardProps {
  event: Event;
}

export function CompactEventCard({ event }: CompactEventCardProps) {
  return (
    <Link href={`/feed/events/${event.id}`} className="block h-full">
      <Card className="h-full flex flex-row overflow-hidden hover:bg-accent/50 transition-colors p-2 gap-3 items-center border-none shadow-sm">
        <div className="w-16 h-16 flex-shrink-0">
          <EventImage src={event.mediaUrl} alt={event.title} aspectRatio="square" className="rounded-sm w-16 h-16" />
        </div>
        <div className="flex-1 min-w-0 py-1">
          <div className="text-xs text-muted-foreground truncate mb-1">
            {formatEventDate(event.startTime, "MMM d, h:mm a")}
          </div>
          <h4 className="font-semibold text-sm leading-tight line-clamp-2 pr-2">
            {event.title}
          </h4>
        </div>
      </Card>
    </Link>
  );
}
