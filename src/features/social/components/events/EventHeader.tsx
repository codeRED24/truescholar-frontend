"use client";

import { format } from "date-fns";
import { MapPin, Calendar, Users, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Event } from "../../types";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const formattedDate = format(startDate, "EEEE, MMMM d, yyyy");
  const formattedTime = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;

  const capacityText = event.capacity 
    ? `${event.rsvpCount} / ${event.capacity} spots filled` 
    : `${event.rsvpCount} people responded`;

  const isFull = event.capacity ? event.rsvpCount >= event.capacity : false;

  return (
    <div className="space-y-6">
      {event.mediaUrl && (
        <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-muted">
          <img 
            src={event.mediaUrl} 
            alt={event.title} 
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          {event.silo && (
            <Badge variant="outline" className="capitalize">
              {event.silo}
            </Badge>
          )}
          {event.recurring && (
            <Badge variant="secondary" className="gap-1">
              <Repeat className="h-3 w-3" /> Recurring
            </Badge>
          )}
          {isFull && (
            <Badge variant="destructive">Fully Booked</Badge>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-2">
          <div className="text-primary font-semibold uppercase tracking-wide">
            {formattedDate}
          </div>
          <h1 className="text-3xl font-bold leading-tight">{event.title}</h1>
        </div>

        <div className="flex flex-col gap-3 mt-4 text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-foreground" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-foreground" />
            <span>{event.location || "Online"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-foreground" />
            <span>{capacityText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
