"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Image, Video, Calendar, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Author } from "../../types";

interface InlineComposerProps {
  currentUser?: Author;
  onPostClick?: () => void;
}

export function InlineComposer({
  currentUser,
  onPostClick,
}: InlineComposerProps) {
  const router = useRouter();
  const userInitials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Card className="overflow-hidden bg-card rounded-xl border shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex gap-3 mb-3">
          <Avatar className="h-12 w-12 cursor-pointer hover:opacity-90">
            <AvatarImage src={currentUser?.image ?? undefined} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <button
            onClick={onPostClick}
            className="flex-1 text-left bg-muted hover:bg-muted/80 rounded-full px-5 py-3 text-muted-foreground transition-colors cursor-text border border-transparent hover:border-border font-medium"
          >
            Start a post
          </button>
        </div>
        <div className="flex justify-between items-center sm:px-4">
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:bg-muted h-12"
            onClick={onPostClick}
          >
            <Image className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline font-medium">Photo</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:bg-muted h-12"
            onClick={onPostClick}
          >
            <Video className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline font-medium">Video</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:bg-muted h-12"
            onClick={() => router.push("/feed/events/create")}
          >
            <Calendar className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline font-medium">Event</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 text-muted-foreground hover:bg-muted h-12"
            onClick={onPostClick}
          >
            <Newspaper className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline font-medium">Article</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
