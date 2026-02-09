"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { type Event } from "../../types";
import { EventImage } from "./EventImage";
import { formatEventDate, getOrganizerInfo } from "../../utils/event-helpers";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { name: organizerName } = getOrganizerInfo(event);
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Coming soon", { description: "Share functionality will be available shortly." });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group h-full flex flex-col border-none shadow-sm bg-card">
      <Link href={`/feed/events/${event.id}`} className="block flex-1 flex flex-col">
        <EventImage src={event.mediaUrl} alt={event.title} aspectRatio="video" />
        
        <CardContent className="p-4 flex-1 flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {formatEventDate(event.startTime)}
          </div>
          
          <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="text-sm text-muted-foreground mt-auto">
            <span className="font-medium text-foreground">{organizerName}</span>
            <span className="mx-1">·</span>
            <span>{event.rsvpCount} going</span>
          </div>
        </CardContent>
      </Link>

      <div className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1 rounded-full" asChild>
          <Link href={`/feed/events/${event.id}`}>View</Link>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full shrink-0" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
