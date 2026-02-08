"use client";

import { Check, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type RSVPStatus } from "../../types";
import { cn } from "@/lib/utils";

interface RsvpButtonsProps {
  status?: RSVPStatus;
  onRsvp: (status: RSVPStatus | null) => void;
  isLoading: boolean;
  isFull?: boolean;
}

export function RsvpButtons({ status, onRsvp, isLoading, isFull }: RsvpButtonsProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant={status === "booked" ? "default" : "outline"}
        className={cn("w-full justify-start", status === "booked" && "bg-green-600 hover:bg-green-700")}
        onClick={() => onRsvp(status === "booked" ? null : "booked")}
        disabled={isLoading || (isFull && status !== "booked")}
      >
        {isFull && status !== "booked" ? (
          <span className="text-muted-foreground">Fully Booked</span>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Going
          </>
        )}
      </Button>
      <Button
        variant={status === "interested" ? "default" : "outline"}
        className={cn("w-full justify-start", status === "interested" && "bg-blue-600 hover:bg-blue-700")}
        onClick={() => onRsvp(status === "interested" ? null : "interested")}
        disabled={isLoading}
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        Interested
      </Button>
      <Button
        variant={status === "not_going" ? "default" : "outline"}
        className={cn("w-full justify-start", status === "not_going" && "bg-red-600 hover:bg-red-700")}
        onClick={() => onRsvp(status === "not_going" ? null : "not_going")}
        disabled={isLoading}
      >
        <X className="mr-2 h-4 w-4" />
        Not Going
      </Button>
    </div>
  );
}
