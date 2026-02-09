"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Users, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useEvent,
  useMyRsvp,
  useRsvp,
} from "@/features/social/hooks/use-events";
import { useSession } from "@/lib/auth-client";
import { useCollegeMemberships } from "@/features/social/hooks/use-memberships";
import { EventImage } from "@/features/social/components/events/EventImage";
import { RsvpButton } from "@/features/social/components/events/RsvpButton";
import { EventMoreMenu } from "@/features/social/components/events/EventMoreMenu";
import { OtherEventsSidebar } from "@/features/social/components/events/OtherEventsSidebar";
import {
  getEventStatus,
  formatEventDate,
  getOrganizerInfo,
} from "@/features/social/utils/event-helpers";
import { toast } from "sonner";
import { EventAttendeeList } from "@/features/social/components/events/EventAttendeeList";

export default function EventDetailPage(props: {
  params: Promise<{ eventId: string }>;
}) {
  const params = use(props.params);
  const eventId = params.eventId;
  const { data: session } = useSession();

  const { data: event, isLoading: isEventLoading, isError } = useEvent(eventId);
  const { data: myRsvp, isLoading: isRsvpLoading } = useMyRsvp(eventId);
  const { data: memberships } = useCollegeMemberships();
  const rsvpMutation = useRsvp(eventId);

  const isOwner = event
    ? (event.organizerType === "user" &&
        event.organizerUserId === session?.user.id) ||
      (event.organizerType === "college" &&
        memberships?.some(
          (m) =>
            m.collegeId === event.organizerCollegeId &&
            ["admin", "owner", "college_admin"].includes(m.role),
        ))
    : false;

  if (isEventLoading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (isError || !event)
    return (
      <div className="text-center py-12 text-destructive">Event not found</div>
    );

  const eventStatus = getEventStatus(event);
  const organizer = getOrganizerInfo(event);
  const isRsvped = myRsvp?.status === "booked";

  const handleRsvp = () => {
    if (!session?.user) {
      toast.error("Please login to RSVP");
      return;
    }
    rsvpMutation.mutate({
      status: isRsvped ? null : "booked",
      currentRsvpId: myRsvp?.id,
    });
  };

  const handleShare = () => {
    toast.info("Coming soon", {
      description: "Share functionality will be available shortly.",
    });
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 pb-20">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="mb-6 rounded-full hover:bg-muted"
      >
        <Link href="/feed/events">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <EventImage
              src={event.mediaUrl}
              alt={event.title}
              aspectRatio="video"
              className="w-full h-[300px] sm:h-[400px] object-cover rounded-none"
            />

            <CardContent className="p-6 sm:p-8 space-y-8">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="text-primary bg-primary/10 hover:bg-primary/20 border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                    >
                      {formatEventDate(event.startTime)}
                    </Badge>
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-foreground">
                      {event.title}
                    </h1>
                  </div>
                  <EventMoreMenu eventId={event.id} isOwner={!!isOwner} />
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={organizer.image || undefined} />
                    <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
                      {organizer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">
                      Hosted by
                    </span>
                    <span className="font-semibold text-base">
                      {organizer.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 gap-6 py-6 border-y border-border/50">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Time</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {formatEventDate(event.startTime, "EEEE, MMMM d")}
                      <br />
                      {formatEventDate(event.startTime, "h:mm a")} -{" "}
                      {formatEventDate(event.endTime, "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Location
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.location || "Online Event"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Attendees
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.rsvpCount} people going
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold tracking-tight">
                  About Event
                </h3>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                  <p className="whitespace-pre-wrap">
                    {event.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-4 pt-4">
                <div className="flex-1">
                  <RsvpButton
                    isRsvped={isRsvped}
                    status={eventStatus}
                    isLoading={rsvpMutation.isPending || isRsvpLoading}
                    onClick={handleRsvp}
                    fullWidth
                    className="h-12 text-base shadow-md"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="h-12 w-12 rounded-xl border-2 hover:bg-muted"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Organizer-Only: Attendee List */}
          {isOwner && <EventAttendeeList eventId={eventId} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <OtherEventsSidebar />
        </div>
      </div>
    </div>
  );
}
