// Post Hook
// CRUD operations for individual posts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getPost, createPost, updatePost, deletePost } from "../api/social-api";
import {
  isApiError,
  type Post,
  type CreatePostDto,
  type UpdatePostDto,
  type FeedResponse,
  type FeedItem,
} from "../types";
import { feedKeys } from "./use-feed";
import { toast } from "sonner";
import { useFeedStore } from "../stores/feed-store"; // Added import

// Query key factory
export const postKeys = {
  all: ["social", "posts"] as const,
  detail: (postId: string) => [...postKeys.all, "detail", postId] as const,
};

/**
 * Hook for fetching a single post
 */
export function usePost(postId: string, options?: { enabled?: boolean }) {
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);
  const prevAuthorRef = useRef<{ type?: string; id?: string } | null>(null);

  const query = useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const result = await getPost(postId, {
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
      if (options?.enabled !== false && postId) {
        query.refetch();
      }
    }
  }, [reactionAuthor, query, options?.enabled, postId]);

  return query;
}

/**
 * Hook for creating a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostDto) => {
      const result = await createPost(data);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: (newPost) => {
      // Add to cache
      queryClient.setQueryData(postKeys.detail(newPost.id), newPost);

      // Invalidate feed to show new post
      queryClient.invalidateQueries({ queryKey: feedKeys.all });

      toast.success("Post created!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create post");
    },
  });
}

/**
 * Hook for updating a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      data,
    }: {
      postId: string;
      data: UpdatePostDto;
    }) => {
      const result = await updatePost(postId, data);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: (updatedPost) => {
      // Update cache
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);

      // Invalidate feed
      queryClient.invalidateQueries({ queryKey: feedKeys.all });

      toast.success("Post updated!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update post");
    },
  });
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await deletePost(postId);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return postId;
    },
    onSuccess: (postId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });

      // Invalidate feed
      queryClient.invalidateQueries({ queryKey: feedKeys.all });

      toast.success("Post deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });
}

/**
 * Helper to update a post in the feed cache (used by optimistic updates)
 */
export function useUpdatePostInCache() {
  const queryClient = useQueryClient();

  return (postId: string, updates: Partial<Post>) => {
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
  };
}
