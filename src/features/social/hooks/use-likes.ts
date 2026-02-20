// Likes Hook
// Optimistic like/unlike with automatic rollback

"use client";

import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type QueryClient,
} from "@tanstack/react-query";
import { getPostLikes, likePost, unlikePost } from "../api/social-api";
import {
  isApiError,
  type Post,
  type FeedResponse,
  type FeedItem,
  type GroupFeedResponse,
  type PostLikesResponse,
} from "../types";
import { feedKeys } from "./use-feed";
import { postKeys } from "./use-post";
import { membershipKeys } from "./use-memberships";
import { groupDetailKeys } from "./use-group-detail";
import { collegePostsKeys } from "./use-college-profile";

interface LikeContext {
  previousPost?: Post;
}

interface MutationStatusError extends Error {
  statusCode?: number;
}

export const likeKeys = {
  all: ["social", "likes"] as const,
  post: (postId: string) => [...likeKeys.all, "post", postId] as const,
};

function resolveCurrentHasLiked(
  queryClient: QueryClient,
  postId: string,
  fallback = false
): boolean {
  const detail = queryClient.getQueryData<Post>(postKeys.detail(postId));
  if (detail) return !!detail.hasLiked;

  const feedCaches = queryClient.getQueriesData<{ pages: FeedResponse[] }>({
    queryKey: feedKeys.all,
  });

  for (const [, cache] of feedCaches) {
    const pages = cache?.pages ?? [];
    for (const page of pages) {
      for (const item of page.items ?? []) {
        if (item.type === "post" && item.post.id === postId) {
          return !!item.post.hasLiked;
        }
      }
    }
  }

  const groupCaches = queryClient.getQueriesData<{ pages?: GroupFeedResponse[] }>({
    queryKey: groupDetailKeys.all,
  });

  for (const [, cache] of groupCaches) {
    const pages = cache?.pages ?? [];
    for (const page of pages) {
      for (const post of page.posts ?? []) {
        if (post.id === postId) {
          return !!post.hasLiked;
        }
      }
    }
  }

  const collegeCaches = queryClient.getQueriesData<{
    pages?: { posts: Post[] }[];
  }>({
    queryKey: collegePostsKeys.all,
  });

  for (const [, cache] of collegeCaches) {
    const pages = cache?.pages ?? [];
    for (const page of pages) {
      for (const post of page.posts ?? []) {
        if (post.id === postId) {
          return !!post.hasLiked;
        }
      }
    }
  }

  return fallback;
}

/**
 * Hook for toggling post likes with optimistic updates
 */
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { postId: string; isLiked: boolean; authorType?: string; collegeId?: number },
    LikeContext
  >({
    mutationFn: async ({ postId, isLiked, authorType, collegeId }) => {
      const options = { authorType, collegeId };
      const result = isLiked
        ? await unlikePost(postId, options)
        : await likePost(postId, options);

      if (isApiError(result)) {
        const error = new Error(result.error);
        (error as MutationStatusError).statusCode = result.statusCode;
        throw error;
      }
    },

    // Optimistic update
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });
      await queryClient.cancelQueries({ queryKey: groupDetailKeys.all });
      await queryClient.cancelQueries({ queryKey: collegePostsKeys.all });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(
        postKeys.detail(postId)
      );

      const getOptimisticLikeState = (post: {
        likeCount: number;
        hasLiked: boolean;
      }) => {
        const currentLikeCount = Number.isFinite(Number(post.likeCount))
          ? Number(post.likeCount)
          : 0;
        const currentHasLiked = !!post.hasLiked;

        return {
          hasLiked: !currentHasLiked,
          likeCount: currentHasLiked
            ? Math.max(0, currentLikeCount - 1)
            : currentLikeCount + 1,
        };
      };

      // Update in feed pages
      queryClient.setQueriesData(
        { queryKey: feedKeys.all },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object") return oldData;

          const data = oldData as {
            pages: FeedResponse[];
          };

          if (!data.pages || !Array.isArray(data.pages)) return oldData;

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((item: FeedItem) => {
                if (item.type === "post" && item.post.id === postId) {
                  const updates = getOptimisticLikeState(item.post);
                  return {
                    ...item,
                    post: { ...item.post, ...updates },
                  };
                }
                return item;
              }),
            })),
          };
        }
      );

      // Update single post cache
      queryClient.setQueryData(
        postKeys.detail(postId),
        (oldPost: Post | undefined) =>
          oldPost
            ? { ...oldPost, ...getOptimisticLikeState(oldPost) }
            : oldPost
      );

      // Update group feed caches (different structure: { pages: [{ posts: [...] }] })
      queryClient.setQueriesData(
        { queryKey: groupDetailKeys.all },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object") return oldData;

          const data = oldData as {
            pages?: GroupFeedResponse[];
            pageParams?: unknown[];
          };

          if (!data.pages || !Array.isArray(data.pages)) return oldData;

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              posts: page.posts?.map((post) => {
                if (post.id === postId) {
                  const updates = getOptimisticLikeState(post);
                  return { ...post, ...updates };
                }
                return post;
              }) ?? [],
            })),
          };
        }
      );

      // Update college posts caches
      queryClient.setQueriesData(
        { queryKey: collegePostsKeys.all },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object") return oldData;

          const data = oldData as {
            pages?: { posts: Post[] }[];
            pageParams?: unknown[];
          };

          if (!data.pages || !Array.isArray(data.pages)) return oldData;

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              posts: page.posts?.map((post) => {
                if (post.id === postId) {
                  const updates = getOptimisticLikeState(post);
                  return { ...post, ...updates };
                }
                return post;
              }) ?? [],
            })),
          };
        }
      );

      return { previousPost };
    },

    // Rollback on error
    onError: async (error: unknown, { postId }, context) => {
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error
          ? (error as MutationStatusError).statusCode
          : undefined;

      // Refresh memberships on 403 Forbidden
      if (statusCode === 403) {
        queryClient.invalidateQueries({ queryKey: membershipKeys.mine() });
      }

      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
      queryClient.invalidateQueries({ queryKey: groupDetailKeys.all });
      queryClient.invalidateQueries({ queryKey: collegePostsKeys.all });
    },
  });
}

/**
 * Convenience hook that returns a simple toggle function
 */
export function useLikePost(postId: string, isLiked: boolean) {
  const queryClient = useQueryClient();
  const toggleLike = useToggleLike();

  return {
    toggle: (options?: { authorType?: string; collegeId?: number }) => {
      const currentHasLiked = resolveCurrentHasLiked(
        queryClient,
        postId,
        isLiked
      );
      toggleLike.mutate({ postId, isLiked: currentHasLiked, ...options });
    },
    isLoading: toggleLike.isPending,
  };
}

/**
 * Hook for fetching post likes with infinite pagination
 */
export function usePostLikes(
  postId: string,
  options?: { enabled?: boolean; limit?: number }
) {
  const limit = options?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: [...likeKeys.post(postId), limit],
    queryFn: async ({ pageParam }) => {
      const result = await getPostLikes(postId, pageParam as string | undefined, limit);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: PostLikesResponse) =>
      lastPage.nextCursor ?? undefined,
    enabled: options?.enabled ?? !!postId,
  });
}
