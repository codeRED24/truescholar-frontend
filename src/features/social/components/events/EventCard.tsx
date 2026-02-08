"use client";

import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type Event } from "../../types";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isCollege = event.organizerType === "college";
  const organizerName = isCollege 
    ? event.organizerCollege?.college_name 
    : event.organizerUser?.name;
  const organizerImage = isCollege
    ? event.organizerCollege?.logo_img
    : event.organizerUser?.image;

  // Fallback if organizer relation not loaded yet
  const displayOrganizerName = organizerName || (isCollege ? "College" : "User");

  const startDate = new Date(event.startTime);
  const formattedDate = format(startDate, "EEE, MMM d");
  const formattedTime = format(startDate, "h:mm a");

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {event.mediaUrl ? (
        <div className="aspect-video w-full overflow-hidden relative bg-muted">
          <img 
            src={event.mediaUrl} 
            alt={event.title} 
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="aspect-[2/1] w-full bg-muted flex items-center justify-center text-muted-foreground">
          <span className="text-4xl">📅</span>
        </div>
      )}
      
      <CardHeader className="p-4 pb-2 flex-none">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="text-sm font-semibold text-primary uppercase mb-1">
              {formattedDate} • {formattedTime}
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2" title={event.title}>
              <Link href={`/feed/events/${event.id}`} className="hover:underline">
                {event.title}
              </Link>
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground gap-2">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{event.location || "Online"}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span>{event.rsvpCount} going</span>
        </div>

        <div className="flex items-center gap-2 pt-2 mt-auto">
          <Avatar className="h-6 w-6">
            <AvatarImage src={organizerImage || undefined} />
            <AvatarFallback>{displayOrganizerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">
            Hosted by <span className="font-medium text-foreground">{displayOrganizerName}</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex-none">
         <Button variant="outline" className="w-full" asChild>
           <Link href={`/feed/events/${event.id}`}>View Details</Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
