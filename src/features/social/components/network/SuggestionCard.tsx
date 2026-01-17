// Suggestion Card Component
// Displays a user suggestion with follow button

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useFollowUser } from "../../hooks/use-network";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  user: {
    id: string;
    name: string;
    image: string | null;
    mutualCount?: number;
  };
  onDismiss?: (userId: string) => void;
}

export function SuggestionCard({ user, onDismiss }: SuggestionCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
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

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(user.id);
  };

  if (isDismissed) return null;

  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-md transition-shadow">
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="p-4 flex flex-col items-center text-center">
        {/* Avatar */}
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>

        {/* Name */}
        <h3 className="font-semibold text-sm line-clamp-1">{user.name}</h3>

        {/* Mutual count */}
        {user.mutualCount && user.mutualCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {user.mutualCount} mutual connection
            {user.mutualCount > 1 ? "s" : ""}
          </p>
        )}

        {/* Follow button */}
        <Button
          variant={isFollowed ? "outline" : "default"}
          size="sm"
          className={cn("mt-4 w-full", isFollowed && "text-muted-foreground")}
          onClick={handleFollow}
          disabled={followUser.isPending || isFollowed}
        >
          {followUser.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowed ? (
            "Following"
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
