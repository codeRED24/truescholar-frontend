// Who to Follow Card Component
// Redesigned to match wireframe with horizontal cards

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, UserPlus, ChevronRight } from "lucide-react";
import { useFollowUser } from "../../hooks/use-network";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FeedSuggestedUser } from "../../types";

interface SuggestionCardItemProps {
  user: FeedSuggestedUser;
}

function SuggestionCardItem({ user }: SuggestionCardItemProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const followUser = useFollowUser();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFollow = async () => {
    try {
      await followUser.mutateAsync(user.id);
      setIsFollowed(true);
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow">
      <Avatar className="h-20 w-20 mb-3 border-4 border-background shadow-sm">
        <AvatarImage src={user.image ?? undefined} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>

      <div className="text-center mb-4 w-full">
        <h4 className="font-bold text-sm truncate px-1">{user.name}</h4>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {user.mutualCount > 0
            ? `${user.mutualCount} mutual connections`
            : "New to TrueScholar"}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 opacity-70">
          Suggested for you
        </p>
      </div>

      <Button
        variant={isFollowed ? "outline" : "default"}
        size="sm"
        className={cn(
          "w-full rounded-full h-9",
          isFollowed ? "text-muted-foreground" : "font-semibold"
        )}
        onClick={handleFollow}
        disabled={followUser.isPending || isFollowed}
      >
        {followUser.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowed ? (
          "Following"
        ) : (
          "Follow"
        )}
      </Button>
    </div>
  );
}

interface WhoToFollowCardProps {
  suggestions: FeedSuggestedUser[];
}

export function WhoToFollowCard({ suggestions }: WhoToFollowCardProps) {
  // Don't render if no suggestions
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="bg-card rounded-2xl border-2 shadow-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-3">
        <h3 className="text-lg font-bold tracking-tight">Who To Follow</h3>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl h-8 text-xs px-3 font-semibold"
        >
          <Link href="/network" className="flex items-center gap-1">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Show top 3 suggestions to match wireframe grid */}
          {suggestions.slice(0, 3).map((user) => (
            <SuggestionCardItem key={user.id} user={user} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
