"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEvent, useMyRsvp, useRsvp } from "@/features/social/hooks/use-events";
import { EventHeader } from "@/features/social/components/events/EventHeader";
import { RsvpButtons } from "@/features/social/components/events/RsvpButtons";
import { EventActions } from "@/features/social/components/events/EventActions";
import { useSession } from "@/lib/auth-client";
import { useCollegeMemberships } from "@/features/social/hooks/use-memberships";

export default function EventDetailPage(props: { params: Promise<{ eventId: string }> }) {
  const params = use(props.params);
  const eventId = params.eventId;
  const { data: session } = useSession();
  
  const { data: event, isLoading: isEventLoading, isError } = useEvent(eventId);
  const { data: myRsvp, isLoading: isRsvpLoading } = useMyRsvp(eventId);
  const { data: memberships } = useCollegeMemberships();
  const rsvpMutation = useRsvp(eventId);

  if (isEventLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="text-center py-12 text-destructive">
        Event not found or error loading event.
      </div>
    );
  }

  const isOwner = 
    (event.organizerType === "user" && event.organizerUserId === session?.user.id) ||
    (event.organizerType === "college" && memberships?.some(
      (m) => 
        m.collegeId === event.organizerCollegeId && 
        ["admin", "owner", "college_admin"].includes(m.role)
    ));
  
  const isCollege = event.organizerType === "college";
  const organizerName = isCollege 
    ? event.organizerCollege?.college_name 
    : event.organizerUser?.name;
  const organizerImage = isCollege
    ? event.organizerCollege?.logo_img
    : event.organizerUser?.image;
  const displayOrganizerName = organizerName || (isCollege ? "College" : "User");

  const isFull = event.capacity ? event.rsvpCount >= event.capacity : false;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/feed/events">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>
        {isOwner && <EventActions eventId={event.id} />}
      </div>

      <EventHeader event={event} />

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30">
            <Avatar className="h-10 w-10">
              <AvatarImage src={organizerImage || undefined} />
              <AvatarFallback>{displayOrganizerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xs text-muted-foreground uppercase font-semibold">Hosted by</div>
              <div className="font-medium">{displayOrganizerName}</div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
              {event.description || "No description provided."}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm space-y-4 sticky top-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Are you going?</div>
              <RsvpButtons 
                status={myRsvp?.status} 
                onRsvp={(status) => rsvpMutation.mutate({ 
                  status, 
                  currentRsvpId: myRsvp?.id 
                })}
                isLoading={rsvpMutation.isPending || isRsvpLoading}
                isFull={isFull}
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm font-medium mb-3">Attendees</div>
              <div className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded">
                Attendee list coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
