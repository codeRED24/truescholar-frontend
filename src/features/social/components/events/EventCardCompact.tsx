"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type Event } from "../../types";

interface EventCardCompactProps {
  event: Event;
}

export function EventCardCompact({ event }: EventCardCompactProps) {
  const startDate = new Date(event.startTime);
  const formattedDate = format(startDate, "EEE, MMM d • h:mm a");

  return (
    <Link href={`/feed/events/${event.id}`} className="block h-full">
      <Card className="overflow-hidden hover:shadow-md transition-shadow flex h-full group">
        {/* Image Section */}
        <div className="w-24 h-full bg-muted flex-shrink-0 relative overflow-hidden">
          {event.mediaUrl ? (
            <img
              src={event.mediaUrl}
              alt={event.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
              <span className="text-xl">📅</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow p-3 flex flex-col justify-center min-w-0">
          <div className="text-xs font-semibold text-primary uppercase mb-1 truncate">
            {formattedDate}
          </div>
          <h3 className="font-bold text-base leading-tight truncate group-hover:underline mb-1" title={event.title}>
            {event.title}
          </h3>
          {event.location && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
