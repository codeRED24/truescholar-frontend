// Feed Hook
// Infinite scroll feed with cursor-based pagination

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getFeed, getGuestFeed } from "../api/social-api";
import { isApiError, type FeedOptions } from "../types";

// Query key factory for cache management
export const feedKeys = {
  all: ["social", "feed"] as const,
  list: (options?: FeedOptions) => [...feedKeys.all, "list", options] as const,
  guest: () => [...feedKeys.all, "guest"] as const,
};

interface UseFeedOptions extends FeedOptions {
  enabled?: boolean;
}

/**
 * Hook for fetching the user's personalized feed with infinite scroll
 */
export function useFeed(options: UseFeedOptions = {}) {
  const { limit = 20, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: feedKeys.list(options),
    queryFn: async ({ pageParam }) => {
      const result = await getFeed(pageParam, limit);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for fetching the guest/trending feed (non-authenticated users)
 */
export function useGuestFeed(options: UseFeedOptions = {}) {
  const { limit = 20, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: feedKeys.guest(),
    queryFn: async ({ pageParam }) => {
      const result = await getGuestFeed(pageParam, limit);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - guest feed is more cacheable
  });
}

/**
 * Helper to flatten paginated feed data into a single array
 * Deduplicates posts across pages to prevent duplicates from trending/connection overlap
 */
export function useFlattenedFeed(options: UseFeedOptions = {}) {
  const query = useFeed(options);

  // Dedupe posts by ID when flattening
  const allPosts = query.data?.pages.flatMap((page) => page.posts) ?? [];
  const seen = new Set<string>();
  const posts = allPosts.filter((post) => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });

  return {
    ...query,
    posts,
    isEmpty: query.isSuccess && posts.length === 0,
  };
}
