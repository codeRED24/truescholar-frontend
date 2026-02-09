"use client";

import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { getRsvpButtonText, EventTimeStatus } from "../../utils/event-helpers";
import { cn } from "@/lib/utils";

interface RsvpButtonProps {
  isRsvped: boolean;
  status: EventTimeStatus;
  isLoading?: boolean;
  onClick: () => void;
  fullWidth?: boolean;
  className?: string;
}

export function RsvpButton({
  isRsvped,
  status,
  isLoading,
  onClick,
  fullWidth,
  className,
}: RsvpButtonProps) {
  const text = getRsvpButtonText(isRsvped, status);

  if (status === "past") {
    if (isRsvped) {
      return (
        <div className="text-sm font-medium text-muted-foreground">
          You attended
        </div>
      );
    }
    return null;
  }

  return (
    <Button
      variant={isRsvped ? "default" : "outline"}
      onClick={onClick}
      disabled={isLoading}
      className={cn(fullWidth && "w-full", className)}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isRsvped ? (
        <Check className="mr-2 h-4 w-4" />
      ) : null}
      {text}
    </Button>
  );
}
