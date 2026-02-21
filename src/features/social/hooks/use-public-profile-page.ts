"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type PublicProfileUser, type UserProfile, getPublicProfile } from "@/api/profile/profile-api";
import { followUser, getFollowStatus, unfollowUser } from "@/features/social/api/social-api";

interface UsePublicProfilePageResult {
  profile: UserProfile | null;
  profileUser: PublicProfileUser | null;
  isOwner: boolean;
  isFollowing: boolean;
  isFollowLoading: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function usePublicProfilePage(
  identifier: string,
  sessionUserId?: string,
): UsePublicProfilePageResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUser, setProfileUser] = useState<PublicProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwner = useMemo(() => {
    if (!sessionUserId || !profileUser?.id) return false;
    return sessionUserId === profileUser.id;
  }, [profileUser?.id, sessionUserId]);

  const loadProfile = useCallback(async () => {
    if (!identifier) {
      setError("Invalid profile URL");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await getPublicProfile(identifier);

    if ("error" in result) {
      setError(result.error || "Failed to fetch profile");
      setProfile(null);
      setProfileUser(null);
    } else {
      setProfile(result.profile);
      setProfileUser(result.user);
    }

    setIsLoading(false);
  }, [identifier]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    let isMounted = true;

    const loadFollowStatus = async () => {
      const targetUserId = profileUser?.id;
      if (!sessionUserId || !targetUserId || isOwner) {
        setIsFollowing(false);
        return;
      }

      const status = await getFollowStatus(targetUserId);
      if (!isMounted) return;

      if (!("error" in status)) {
        setIsFollowing(status.data.isFollowing);
      }
    };

    loadFollowStatus();

    return () => {
      isMounted = false;
    };
  }, [isOwner, profileUser?.id, sessionUserId]);

  const toggleFollow = useCallback(async () => {
    const targetUserId = profileUser?.id;
    if (!sessionUserId || !targetUserId || isOwner || isFollowLoading) return;

    setIsFollowLoading(true);
    const previous = isFollowing;
    setIsFollowing(!previous);

    try {
      if (previous) {
        const response = await unfollowUser(targetUserId);
        if ("error" in response) {
          setIsFollowing(previous);
          toast.error(response.error || "Failed to unfollow");
          return;
        }
        toast.success("Unfollowed");
      } else {
        const response = await followUser(targetUserId);
        if ("error" in response) {
          setIsFollowing(previous);
          toast.error(response.error || "Failed to follow");
          return;
        }
        toast.success("Following");
      }
    } catch {
      setIsFollowing(previous);
      toast.error("Something went wrong while updating follow state");
    } finally {
      setIsFollowLoading(false);
    }
  }, [isFollowLoading, isFollowing, isOwner, profileUser?.id, sessionUserId]);

  return {
    profile,
    profileUser,
    isOwner,
    isFollowing,
    isFollowLoading,
    isLoading,
    error,
    toggleFollow,
    refreshProfile: loadProfile,
  };
}
