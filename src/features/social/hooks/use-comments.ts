// Comments Hook
// Infinite scroll comments with CRUD operations

"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getComments,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getReplies,
} from "../api/social-api";
import { isApiError, type Comment, type CreateCommentDto } from "../types";
import { postKeys, useUpdatePostInCache } from "./use-post";

// Query key factory
export const commentKeys = {
  all: ["social", "comments"] as const,
  list: (postId: string) => [...commentKeys.all, "list", postId] as const,
  replies: (postId: string, commentId: string) =>
    [...commentKeys.all, "replies", postId, commentId] as const,
};

/**
 * Hook for fetching comments with infinite scroll
 */
export function useComments(postId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: commentKeys.list(postId),
    queryFn: async ({ pageParam }) => {
      const result = await getComments(postId, pageParam);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options?.enabled ?? !!postId,
  });
}

/**
 * Helper to flatten paginated comments
 */
export function useFlattenedComments(
  postId: string,
  options?: { enabled?: boolean }
) {
  const query = useComments(postId, options);

  const comments =
    query.data?.pages.flatMap((page) => page.comments ?? []).filter(Boolean) ??
    [];

  return {
    ...query,
    comments,
    isEmpty: query.isSuccess && comments.length === 0,
  };
}

/**
 * Hook for creating a comment
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  const updatePostInCache = useUpdatePostInCache();

  return useMutation({
    mutationFn: async (data: CreateCommentDto) => {
      const result = await createComment(postId, data);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate comments
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });

      // Increment comment count on post
      updatePostInCache(postId, {
        commentCount:
          (
            queryClient.getQueryData(postKeys.detail(postId)) as {
              commentCount: number;
            }
          )?.commentCount + 1 || 1,
      });
    },
  });
}

/**
 * Hook for deleting a comment
 */
export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  const updatePostInCache = useUpdatePostInCache();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const result = await deleteComment(postId, commentId);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return commentId;
    },
    onSuccess: () => {
      // Invalidate comments
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });

      // Decrement comment count on post
      const currentCount =
        (
          queryClient.getQueryData(postKeys.detail(postId)) as {
            commentCount: number;
          }
        )?.commentCount || 1;
      updatePostInCache(postId, {
        commentCount: Math.max(0, currentCount - 1),
      });
    },
  });
}

/**
 * Hook for toggling comment likes
 */
export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
      parentId,
    }: {
      commentId: string;
      isLiked: boolean;
      parentId?: string;
    }) => {
      const result = isLiked
        ? await unlikeComment(postId, commentId)
        : await likeComment(postId, commentId);

      if (isApiError(result)) {
        throw new Error(result.error);
      }
    },

    // Optimistic update
    onMutate: async ({ commentId, isLiked, parentId }) => {
      // If it's a reply, update the specific replies cache
      if (parentId) {
        const repliesKey = commentKeys.replies(postId, parentId);
        await queryClient.cancelQueries({ queryKey: repliesKey });

        queryClient.setQueryData(
          repliesKey,
          (oldData: Comment[] | undefined) => {
            if (!oldData) return oldData;

            return oldData.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    hasLiked: !isLiked,
                    likeCount: isLiked
                      ? Math.max(0, comment.likeCount - 1)
                      : comment.likeCount + 1,
                  }
                : comment
            );
          }
        );
      }

      // Always try to update the main list as well (for root comments or flat views)
      await queryClient.cancelQueries({ queryKey: commentKeys.list(postId) });

      queryClient.setQueriesData(
        { queryKey: commentKeys.list(postId) },
        (oldData: unknown) => {
          if (!oldData || typeof oldData !== "object") return oldData;

          const data = oldData as {
            pages: Array<{ comments: Comment[]; nextCursor: string | null }>;
          };

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              comments: page.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      hasLiked: !isLiked,
                      likeCount: isLiked
                        ? Math.max(0, comment.likeCount - 1)
                        : comment.likeCount + 1,
                    }
                  : comment
              ),
            })),
          };
        }
      );
    },

    onError: (_err, { parentId }) => {
      if (parentId) {
        queryClient.invalidateQueries({
          queryKey: commentKeys.replies(postId, parentId),
        });
      }
      queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) });
    },
  });
}

/**
 * Hook for fetching replies to a comment (lazy loaded)
 */
export function useReplies(
  postId: string,
  commentId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: commentKeys.replies(postId, commentId),
    queryFn: async () => {
      const result = await getReplies(postId, commentId);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: options?.enabled ?? false, // Only fetch when explicitly enabled
  });
}
