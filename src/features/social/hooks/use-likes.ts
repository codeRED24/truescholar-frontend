// Likes Hook
// Optimistic like/unlike with automatic rollback

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "../api/social-api";
import { isApiError, type Post } from "../types";
import { feedKeys } from "./use-feed";
import { postKeys } from "./use-post";

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
    { postId: string; isLiked: boolean },
    LikeContext
  >({
    mutationFn: async ({ postId, isLiked }) => {
      const result = isLiked
        ? await unlikePost(postId)
        : await likePost(postId);

      if (isApiError(result)) {
        throw new Error(result.error);
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
            pages: Array<{ posts: Post[]; nextCursor: string | null }>;
          };

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId ? { ...post, ...updates } : post
              ),
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
    onError: (_error, { postId }, context) => {
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
    toggle: () => toggleLike.mutate({ postId, isLiked }),
    isLoading: toggleLike.isPending,
  };
}
