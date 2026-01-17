// Network Hooks
// React Query hooks for network features (suggestions, followers, following)

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuggestions,
  getFollowers,
  getFollowing,
  getFollowerStats,
  followUser,
  unfollowUser,
  type SuggestedUser,
  type FollowEntry,
  type FollowStats,
} from "../api/network-api";

// Query key factory
export const networkKeys = {
  all: ["network"] as const,
  suggestions: () => [...networkKeys.all, "suggestions"] as const,
  followers: () => [...networkKeys.all, "followers"] as const,
  following: () => [...networkKeys.all, "following"] as const,
  stats: () => [...networkKeys.all, "stats"] as const,
};

// ============================================================================
// Suggestions Hook
// ============================================================================

export function useSuggestions(limit = 20) {
  return useQuery({
    queryKey: networkKeys.suggestions(),
    queryFn: async () => {
      const result = await getSuggestions(limit);
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

// ============================================================================
// Followers/Following Hooks
// ============================================================================

export function useFollowers(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...networkKeys.followers(), page],
    queryFn: async () => {
      const result = await getFollowers(page, limit);
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useFollowing(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...networkKeys.following(), page],
    queryFn: async () => {
      const result = await getFollowing(page, limit);
      if (result.error) throw new Error(result.error);
      return result.data ?? [];
    },
  });
}

export function useFollowerStats() {
  return useQuery({
    queryKey: networkKeys.stats(),
    queryFn: async () => {
      const result = await getFollowerStats();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}

// ============================================================================
// Follow/Unfollow Mutations
// ============================================================================

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await followUser(userId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: networkKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: networkKeys.following() });
      queryClient.invalidateQueries({ queryKey: networkKeys.stats() });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await unfollowUser(userId);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.following() });
      queryClient.invalidateQueries({ queryKey: networkKeys.stats() });
    },
  });
}
