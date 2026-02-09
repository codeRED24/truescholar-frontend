import { Suspense } from "react";
import { EventForm } from "@/features/social/components/events/EventForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateEventPage() {
  return (
    <div className="container mx-auto space-y-8 max-w-7xl px-4 py-12 pb-24">
      <div className="flex items-center gap-4 border-b pb-6">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="rounded-full hover:bg-muted"
        >
          <Link href="/feed/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
          <p className="text-muted-foreground mt-1">
            Share an event with your community
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <EventForm mode="create" />
      </Suspense>
    </div>
  );
}
