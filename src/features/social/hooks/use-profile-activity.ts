"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getUserComments,
  getUserFollowStats,
  getUserPosts,
  type UserCommentsActivityResponse,
  type UserPostsActivityResponse,
  type UserCommentActivityItem,
} from "@/features/social/api/social-api";
import { isApiError, type Post } from "@/features/social/types";

interface UseProfileActivityOptions {
  enabled?: boolean;
  limit?: number;
}

interface UseProfileActivityResult<TItem> {
  items: TItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  refetch: () => Promise<unknown>;
}

export const profileActivityKeys = {
  all: ["social", "profile-activity"] as const,
  posts: (userId: string, limit: number) =>
    [...profileActivityKeys.all, "posts", userId, limit] as const,
  comments: (userId: string, limit: number) =>
    [...profileActivityKeys.all, "comments", userId, limit] as const,
  stats: (userId: string) => [...profileActivityKeys.all, "stats", userId] as const,
};

export function useUserPostsActivity(
  userId: string,
  options: UseProfileActivityOptions = {},
): UseProfileActivityResult<Post> {
  const { enabled = true, limit = 6 } = options;

  const query = useInfiniteQuery({
    queryKey: profileActivityKeys.posts(userId, limit),
    queryFn: async ({ pageParam }) => {
      const result = await getUserPosts(userId, pageParam, limit);
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(userId),
  });

  const pages: UserPostsActivityResponse[] = query.data?.pages ?? [];
  const items = pages.flatMap((page) => page.posts ?? []);
  const nextCursor =
    pages.length > 0 ? (pages[pages.length - 1]?.nextCursor ?? null) : null;

  return {
    items,
    nextCursor,
    hasNextPage: Boolean(query.hasNextPage),
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: async () => query.fetchNextPage(),
    refetch: async () => query.refetch(),
  };
}

export function useUserCommentsActivity(
  userId: string,
  options: UseProfileActivityOptions = {},
): UseProfileActivityResult<UserCommentActivityItem> {
  const { enabled = true, limit = 6 } = options;

  const query = useInfiniteQuery({
    queryKey: profileActivityKeys.comments(userId, limit),
    queryFn: async ({ pageParam }) => {
      const result = await getUserComments(userId, pageParam, limit);
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Boolean(userId),
  });

  const pages: UserCommentsActivityResponse[] = query.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items ?? []);
  const nextCursor =
    pages.length > 0 ? (pages[pages.length - 1]?.nextCursor ?? null) : null;

  return {
    items,
    nextCursor,
    hasNextPage: Boolean(query.hasNextPage),
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: async () => query.fetchNextPage(),
    refetch: async () => query.refetch(),
  };
}

export function useUserFollowStats(
  userId: string,
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: profileActivityKeys.stats(userId),
    queryFn: async () => {
      const result = await getUserFollowStats(userId);
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: enabled && Boolean(userId),
  });
}
