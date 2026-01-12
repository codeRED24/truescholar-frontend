// Inline Composer Trigger
// Compact card that opens the full post composer modal

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Calendar, FileText } from "lucide-react";
import type { Author } from "../../types";
import { cn } from "@/lib/utils";

interface ComposerTriggerProps {
  currentUser?: Author;
  onOpen: () => void;
  className?: string;
}

export function ComposerTrigger({
  currentUser,
  onOpen,
  className,
}: ComposerTriggerProps) {
  const userInitials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className={cn("bg-card rounded-xl border shadow-sm p-4", className)}>
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={currentUser?.image ?? undefined} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>

        <button
          onClick={onOpen}
          className="flex-1 h-12 px-4 text-left text-muted-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
        >
          Start a post...
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Image className="h-5 w-5 text-primary" />
          Photo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Calendar className="h-5 w-5 text-primary" />
          Event
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpen}
          className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
        >
          <FileText className="h-5 w-5 text-primary" />
          Article
        </Button>
      </div>
    </div>
  );
}
