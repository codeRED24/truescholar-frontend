"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useMyRsvpedEvents } from "../../hooks/use-events";
import { CompactEventCard } from "./CompactEventCard";
import { Loader2 } from "lucide-react";

export function YourEventsCarousel() {
  const [emblaRef] = useEmblaCarousel({ 
    align: "start", 
    slidesToScroll: 1,
    containScroll: "trimSnaps" 
  });
  
  const { data: events, isLoading } = useMyRsvpedEvents();

  if (isLoading) return <div className="h-24 flex items-center justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Your events</h2>
        <Link href="/feed/events/my" className="text-sm text-primary hover:underline">
          Show all
        </Link>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {events.slice(0, 10).map((event) => (
            <div key={event.id} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_30%] min-w-0">
              <CompactEventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
