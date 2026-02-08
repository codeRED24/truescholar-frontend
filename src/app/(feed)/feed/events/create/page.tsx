import { Suspense } from "react";
import { EventForm } from "@/features/social/components/events/EventForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feed/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>

      <Suspense fallback={null}>
        <EventForm mode="create" />
      </Suspense>
    </div>
  );
}
