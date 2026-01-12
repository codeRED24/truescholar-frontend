// Feed Empty State Component
// Displayed when there are no posts in the feed

"use client";

import { Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedEmptyProps {
  isAuthenticated?: boolean;
}

export function FeedEmpty({ isAuthenticated = false }: FeedEmptyProps) {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Welcome to TrueScholar</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          Sign in to see personalized content from your connections and discover
          trending posts in academia.
        </p>
        <Button>Sign in to explore</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your feed is empty</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start following people and topics to see their posts here. Discover
        researchers, institutions, and ideas that interest you.
      </p>
      <Button>Discover people to follow</Button>
    </div>
  );
}
