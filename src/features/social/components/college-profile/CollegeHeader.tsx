"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  Calendar,
  Users,
  MessageCircle,
  MoreHorizontal,
  Check,
  UserPlus,
  Loader2,
} from "lucide-react";
import { CollegeProfileResponse } from "../../types";
import { useFollowCollege, useUnfollowCollege } from "../../hooks/use-college-profile";
import { toast } from "sonner";

interface CollegeHeaderProps {
  profile: CollegeProfileResponse;
  slugId: string;
}

export function CollegeHeader({ profile, slugId }: CollegeHeaderProps) {
  const { college, socialProof } = profile;
  
  // Reuse existing follow hooks - they work with collegeId
  // Note: These hooks might need adjustment if they expect group-specific query keys
  // but for mutation they just call the API which is shared.
  // Ideally we should have useFollowCollege hook, but useFollowGroup works for now if keys align.
  // Actually, useFollowGroup invalidates ['group-profile'], but we want to invalidate ['college-profile'].
  // I should probably create a new hook or just manual invalidation.
  // For now, I'll use the existing hook and assume it works for the mutation action.
  const followMutation = useFollowCollege(slugId, college.id);
  const unfollowMutation = useUnfollowCollege(slugId, college.id);

  const handleFollowToggle = async () => {
    try {
      if (college.isFollowing) {
        await unfollowMutation.mutateAsync();
        toast.success("Unfollowed");
      } else {
        await followMutation.mutateAsync();
        toast.success("Following");
      }
    } catch {
      toast.error("Failed to update follow status");
    }
  };

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  const initials = college.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-background border rounded-lg overflow-hidden mb-6">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative">
        {college.banner && (
          <img
            src={college.banner}
            alt={college.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-6 pb-6 relative">
        {/* Logo - overlapping banner */}
        <div className="-mt-12 mb-4 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-background shadow-sm rounded-lg">
            <AvatarImage src={college.logo ?? undefined} alt={college.name} />
            <AvatarFallback className="rounded-lg text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Grid */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex-1 space-y-2">
            <div>
              <h1 className="text-2xl font-bold">{college.name}</h1>
              <p className="text-muted-foreground text-sm">
                {college.tagline || college.city ? (
                  <>
                    {college.tagline}
                    {college.tagline && college.city && " • "}
                    {college.city && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {college.city}
                      </span>
                    )}
                  </>
                ) : (
                  "Education Management"
                )}
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {socialProof.mutualFollowers.length > 0 ? (
                <>
                  <div className="flex -space-x-2">
                    {socialProof.mutualFollowers.map((user) => (
                      <Avatar
                        key={user.id}
                        className="h-6 w-6 border-2 border-background"
                      >
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback className="text-[10px]">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span>
                    <span className="font-medium text-foreground">
                      {socialProof.mutualFollowers[0].name}
                    </span>{" "}
                    and {socialProof.totalMutualCount - 1} others follow this
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {college.followerCount.toLocaleString()} followers
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleFollowToggle}
                disabled={isLoading}
                variant={college.isFollowing ? "outline" : "default"}
                className="rounded-full px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : college.isFollowing ? (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" /> Follow
                  </>
                )}
              </Button>
              <Button variant="outline" className="rounded-full" disabled>
                <MessageCircle className="h-4 w-4 mr-2" /> Message
              </Button>
              <Button variant="outline" className="rounded-full w-10 p-0" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
