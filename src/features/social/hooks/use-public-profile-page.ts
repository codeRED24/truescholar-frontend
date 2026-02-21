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
}

export function usePublicProfilePage(
  userId: string,
  sessionUserId?: string,
): UsePublicProfilePageResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUser, setProfileUser] = useState<PublicProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwner = useMemo(() => {
    if (!sessionUserId) return false;
    return sessionUserId === userId;
  }, [sessionUserId, userId]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId) {
        if (isMounted) {
          setError("Invalid profile URL");
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const result = await getPublicProfile(userId);
      if (!isMounted) return;

      if ("error" in result) {
        setError(result.error || "Failed to fetch profile");
        setProfile(null);
        setProfileUser(null);
      } else {
        setProfile(result.profile);
        setProfileUser(result.user);
      }

      setIsLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const loadFollowStatus = async () => {
      if (!sessionUserId || !userId || isOwner) {
        setIsFollowing(false);
        return;
      }

      const status = await getFollowStatus(userId);
      if (!isMounted) return;

      if (!("error" in status)) {
        setIsFollowing(status.data.isFollowing);
      }
    };

    loadFollowStatus();

    return () => {
      isMounted = false;
    };
  }, [sessionUserId, userId, isOwner]);

  const toggleFollow = useCallback(async () => {
    if (!sessionUserId || !userId || isOwner || isFollowLoading) return;

    setIsFollowLoading(true);
    const previous = isFollowing;
    setIsFollowing(!previous);

    try {
      if (previous) {
        const response = await unfollowUser(userId);
        if ("error" in response) {
          setIsFollowing(previous);
          toast.error(response.error || "Failed to unfollow");
          return;
        }
        toast.success("Unfollowed");
      } else {
        const response = await followUser(userId);
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
  }, [isFollowLoading, isFollowing, isOwner, sessionUserId, userId]);

  return {
    profile,
    profileUser,
    isOwner,
    isFollowing,
    isFollowLoading,
    isLoading,
    error,
    toggleFollow,
  };
}
