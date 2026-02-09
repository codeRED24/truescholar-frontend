"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventsList } from "@/features/social/components/events/EventsList";
import { YourEventsCarousel } from "@/features/social/components/events/YourEventsCarousel";
import { useSession } from "@/lib/auth-client";

export default function EventsPage() {
  const { data: session } = useSession();

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-12 px-4 py-10">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold">Events</h1>
          <Button asChild className="rounded-full px-6">
            <Link href="/feed/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create an event
            </Link>
          </Button>
        </CardContent>
      </Card>

      {session?.user && (
        <section>
          <Card>
            <CardContent className="p-6">
              <YourEventsCarousel />
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <Card>
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-bold">Recommended for you</h2>
            <EventsList filters={{ startAfter: new Date().toISOString(), limit: 12 }} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
