"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Event } from "../../types";
import { EventImage } from "./EventImage";
import { getEventStatus, formatEventDate, getOrganizerInfo } from "../../utils/event-helpers";

interface MyEventCardProps {
  event: Event;
}

export function MyEventCard({ event }: MyEventCardProps) {
  const status = getEventStatus(event);
  const { name: organizerName } = getOrganizerInfo(event);

  return (
    <Link href={`/feed/events/${event.id}`} className="block group">
      <div className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
        <div className="w-24 h-24 flex-shrink-0">
          <EventImage src={event.mediaUrl} alt={event.title} aspectRatio="square" className="rounded-md h-full w-full" />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={status === "past" ? "secondary" : "default"} className="text-xs uppercase">
              {status === "live" ? "Live" : status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • {formatEventDate(event.startTime)}
            </span>
          </div>
          
          <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="text-sm text-muted-foreground truncate">
            {event.location || "Online"} • By {organizerName}
          </div>
        </div>
      </div>
    </Link>
  );
}
