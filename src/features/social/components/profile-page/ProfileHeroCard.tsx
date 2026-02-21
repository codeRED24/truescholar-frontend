"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Loader2, MapPin, MessageCircle, MoreHorizontal } from "lucide-react";
import { type PublicProfileUser, type UserProfile } from "@/api/profile/profile-api";

interface ProfileHeroCardProps {
  profile: UserProfile | null;
  profileUser: PublicProfileUser;
  isOwner: boolean;
  isAuthenticated: boolean;
  isFollowing: boolean;
  isFollowLoading: boolean;
  onToggleFollow: () => Promise<void>;
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const initials = name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "U";
}

function getJoinedDate(dateValue: string): string {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileHeroCard({
  profile,
  profileUser,
  isOwner,
  isAuthenticated,
  isFollowing,
  isFollowLoading,
  onToggleFollow,
}: ProfileHeroCardProps) {
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");

  const headline = useMemo(() => {
    if (profile?.bio?.trim()) {
      return profile.bio.trim().split("\n")[0].slice(0, 90);
    }
    return "TrueScholar member";
  }, [profile?.bio]);

  return (
    <Card className="overflow-hidden border-neutral-200 shadow-sm">
      <div className="h-24 bg-linear-to-r from-primary-main/80 to-primary-main/50 sm:h-32" />

      <CardContent className="relative p-4 sm:p-6">
        <div className="-mt-14 mb-4 sm:-mt-16">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm sm:h-28 sm:w-28 dark:border-neutral-900">
            <AvatarImage src={profileUser.image || undefined} alt={profileUser.name} />
            <AvatarFallback className="bg-primary-main text-xl font-semibold text-white sm:text-2xl">
              {getInitials(profileUser.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{profileUser.name}</h1>
            <p className="text-sm text-muted-foreground">{headline}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              {location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {getJoinedDate(profileUser.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && !isOwner ? (
              <Button
                onClick={onToggleFollow}
                disabled={isFollowLoading}
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full"
              >
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  "Follow"
                )}
              </Button>
            ) : null}
            <Button variant="outline" disabled className="rounded-full">
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
            <Button
              variant="outline"
              disabled
              size="icon"
              className="rounded-full"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">{profileUser.email}</div>
      </CardContent>
    </Card>
  );
}

export function ProfileHeroCardSkeleton() {
  return (
    <Card className="overflow-hidden border-neutral-200 shadow-sm">
      <Skeleton className="h-24 sm:h-32" />
      <CardContent className="p-4 sm:p-6">
        <div className="-mt-14 mb-4">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-white sm:h-28 sm:w-28 dark:border-neutral-900" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardContent>
    </Card>
  );
}
