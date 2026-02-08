"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsTabs } from "@/features/social/components/events/EventsTabs";
import { EventsList } from "@/features/social/components/events/EventsList";
import { EventQueryDto } from "@/features/social/types";
import { useSession } from "@/lib/auth-client";

export default function EventsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("upcoming");

  const getFilters = (): EventQueryDto => {
    const now = new Date().toISOString();
    
    switch (activeTab) {
      case "upcoming":
        return { startAfter: now, limit: 10 };
      case "past":
        return { startBefore: now, limit: 10 };
      case "my-events":
        // Currently shows events created by user. 
        // TODO: Update to include RSVPs once backend supports it
        return { organizerUserId: session?.user.id, limit: 10 }; 
      default:
        return { limit: 10 };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/feed/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <EventsList key={activeTab} filters={getFilters()} />
    </div>
  );
}
