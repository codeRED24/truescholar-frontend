// User Card Component
// Displays a follower/following user with actions

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserMinus, MessageCircle, Loader2 } from "lucide-react";
import { useUnfollowUser } from "../../hooks/use-network";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfilePath } from "../../utils/author-navigation";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    image: string | null;
    handle?: string | null;
    user_type?: string;
  };
  showUnfollow?: boolean;
  onMessageClick?: (userId: string) => void;
}

export function UserCard({
  user,
  showUnfollow = false,
  onMessageClick,
}: UserCardProps) {
  const router = useRouter();
  const [isUnfollowed, setIsUnfollowed] = useState(false);
  const unfollowUser = useUnfollowUser();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleUnfollow = async () => {
    try {
      await unfollowUser.mutateAsync(user.id);
      setIsUnfollowed(true);
    } catch (error) {
      console.error("Failed to unfollow user:", error);
    }
  };

  const handleProfileClick = () => {
    if (!user.handle) return;
    router.push(getUserProfilePath(user.handle));
  };

  if (isUnfollowed) return null;

  return (
    <Card className="bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <Avatar
          className="h-12 w-12 transition-opacity hover:opacity-80"
          onClick={handleProfileClick}
        >
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <h3
            className="line-clamp-1 text-sm font-semibold hover:underline"
            onClick={handleProfileClick}
          >
            {user.name}
          </h3>
          {user.user_type && (
            <p className="text-xs text-muted-foreground capitalize">
              {user.user_type}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onMessageClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMessageClick(user.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}

          {showUnfollow && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleUnfollow}
              disabled={unfollowUser.isPending}
            >
              {unfollowUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
