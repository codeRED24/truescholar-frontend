// Likes Hook
// Optimistic like/unlike with automatic rollback

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "../api/social-api";
import { isApiError, type Post, type FeedResponse, type FeedItem } from "../types";
import { feedKeys } from "./use-feed";
import { postKeys } from "./use-post";
import { membershipKeys } from "./use-memberships"; // Added

interface LikeContext {
  previousPost?: Post;
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
        (error as any).statusCode = result.statusCode;
        throw error;
      }
    },

    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      // Snapshot previous value
      const previousPost = queryClient.getQueryData<Post>(
        postKeys.detail(postId)
      );

      // Optimistically update the post
      const updates = {
        hasLiked: !isLiked,
        likeCount: isLiked
          ? Math.max(0, (previousPost?.likeCount ?? 1) - 1)
          : (previousPost?.likeCount ?? 0) + 1,
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
          oldPost ? { ...oldPost, ...updates } : oldPost
      );

      return { previousPost };
    },

    // Rollback on error
    onError: async (error: any, { postId }, context) => {
      // Refresh memberships on 403 Forbidden
      if (error?.statusCode === 403) {
        queryClient.invalidateQueries({ queryKey: membershipKeys.mine() });
      }

      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

/**
 * Convenience hook that returns a simple toggle function
 */
export function useLikePost(postId: string, isLiked: boolean) {
  const toggleLike = useToggleLike();

  return {
    toggle: (options?: { authorType?: string; collegeId?: number }) =>
      toggleLike.mutate({ postId, isLiked, ...options }),
    isLoading: toggleLike.isPending,
  };
}
