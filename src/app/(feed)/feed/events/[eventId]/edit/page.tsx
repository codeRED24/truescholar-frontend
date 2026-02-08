"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventForm } from "@/features/social/components/events/EventForm";
import { useEvent } from "@/features/social/hooks/use-events";
import { useSession } from "@/lib/auth-client";
import { useCollegeMemberships } from "@/features/social/hooks/use-memberships";

export default function EditEventPage(props: { params: Promise<{ eventId: string }> }) {
  const params = use(props.params);
  const eventId = params.eventId;
  const { data: session } = useSession();
  
  const { data: event, isLoading: isEventLoading, isError } = useEvent(eventId);
  const { data: memberships, isLoading: isMembershipsLoading } = useCollegeMemberships();

  const isLoading = isEventLoading || isMembershipsLoading;

  if (isLoading) {
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

  // Authorization Check
  const isOrganizer = 
    (event.organizerType === "user" && event.organizerUserId === session?.user.id) ||
    (event.organizerType === "college" && memberships?.some(
      (m) => 
        m.collegeId === event.organizerCollegeId && 
        ["admin", "owner", "college_admin"].includes(m.role)
    ));

  if (!isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You don't have permission to edit this event.</p>
        <Button asChild>
          <Link href={`/feed/events/${eventId}`}>Back to Event</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/feed/events/${eventId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Event</h1>
      </div>

      <EventForm mode="edit" initialData={event} eventId={eventId} />
    </div>
  );
}
