// Comments Hook
// Infinite scroll comments with CRUD operations

"use client";

import { useEffect, useRef } from "react";
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
import { membershipKeys } from "./use-memberships";
import { useFeedStore } from "../stores/feed-store"; // Added import

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
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);
  const prevAuthorRef = useRef<{ type?: string; id?: string } | null>(null);

  const query = useInfiniteQuery({
    queryKey: commentKeys.list(postId),
    queryFn: async ({ pageParam }) => {
      const result = await getComments(postId, pageParam, 10, {
        authorType: reactionAuthor?.type,
        collegeId:
          reactionAuthor?.type === "college"
            ? parseInt(reactionAuthor.id)
            : undefined,
      });

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: options?.enabled ?? !!postId,
  });

  // Refetch when identity changes
  useEffect(() => {
    const prev = prevAuthorRef.current;
    const curr = reactionAuthor;

    if (prev === null) {
      prevAuthorRef.current = curr;
      return;
    }

    if (prev?.id !== curr?.id || prev?.type !== curr?.type) {
      prevAuthorRef.current = curr;
      query.refetch();
    }
  }, [reactionAuthor, query]);

  return query;
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
    mutationFn: async (
      data: CreateCommentDto & { authorType?: string; collegeId?: number }
    ) => {
      const result = await createComment(postId, data);

      if (isApiError(result)) {
        const error = new Error(result.error);
        (error as any).statusCode = result.statusCode;
        throw error;
      }

      return result.data;
    },
    onError: async (error: any) => {
      // Refresh memberships on 403 Forbidden
      if (error?.statusCode === 403) {
        queryClient.invalidateQueries({ queryKey: membershipKeys.mine() });
      }
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
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);

  const authorContext = reactionAuthor
    ? {
        type: reactionAuthor.type,
        id: reactionAuthor.id,
      }
    : undefined;

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
      parentId,
      authorType,
      collegeId,
    }: {
      commentId: string;
      isLiked: boolean;
      parentId?: string;
      authorType?: string;
      collegeId?: number;
    }) => {
      const options = { authorType, collegeId };
      const result = isLiked
        ? await unlikeComment(postId, commentId, options)
        : await likeComment(postId, commentId, options);

      if (isApiError(result)) {
        const error = new Error(result.error);
        (error as any).statusCode = result.statusCode;
        throw error;
      }
    },

    // Optimistic update
    onMutate: async ({ commentId, isLiked, parentId }) => {
      // If it's a reply, update the specific replies cache
      if (parentId) {
        // We use setQueriesData with fuzzy matching to cover all contexts,
        // but targeting the specific one is better if possible.
        // However, since we want to be robust, let's try fuzzy match on the base parts.
        // Actually, we can use the current context since that's what the user is seeing.
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
      // Use fuzzy matching for the list to be safe, or specific context
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

    onError: async (error: any, { parentId }) => {
      // Refresh memberships on 403 Forbidden
      if (error?.statusCode === 403) {
        queryClient.invalidateQueries({ queryKey: membershipKeys.mine() });
      }

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
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);
  const prevAuthorRef = useRef<{ type?: string; id?: string } | null>(null);

  const query = useQuery({
    queryKey: commentKeys.replies(postId, commentId),
    queryFn: async () => {
      const result = await getReplies(postId, commentId, 20, {
        authorType: reactionAuthor?.type,
        collegeId:
          reactionAuthor?.type === "college"
            ? parseInt(reactionAuthor.id)
            : undefined,
      });

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: options?.enabled ?? false, // Only fetch when explicitly enabled
  });

  // Refetch when identity changes
  useEffect(() => {
    const prev = prevAuthorRef.current;
    const curr = reactionAuthor;

    if (prev === null) {
      prevAuthorRef.current = curr;
      return;
    }

    if (prev?.id !== curr?.id || prev?.type !== curr?.type) {
      prevAuthorRef.current = curr;
      if (options?.enabled) {
        query.refetch();
      }
    }
  }, [reactionAuthor, query, options?.enabled]);

  return query;
}
