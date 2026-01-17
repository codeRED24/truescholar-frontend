// Post Hook
// CRUD operations for individual posts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Query key factory
export const postKeys = {
  all: ["social", "posts"] as const,
  detail: (postId: string) => [...postKeys.all, "detail", postId] as const,
};

/**
 * Hook for fetching a single post
 */
export function usePost(postId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: async () => {
      const result = await getPost(postId);

      if (isApiError(result)) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: options?.enabled ?? !!postId,
  });
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
