"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyRequests,
  getSuggestedColleges,
  createLinkRequest,
  followCollege,
  cancelLinkRequest,
} from "../api/social-api";
import { isApiError, LinkRequest } from "../types";

export const groupKeys = {
  all: ["groups"] as const,
  requests: () => [...groupKeys.all, "requests"] as const,
  suggestions: () => [...groupKeys.all, "suggestions"] as const,
};

// Query: Get pending requests
export function useMyRequests() {
  return useQuery({
    queryKey: groupKeys.requests(),
    queryFn: async () => {
      const result = await getMyRequests();
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
  });
}

// Query: Get suggested colleges
export function useGroupSuggestions(limit = 5) {
  return useQuery({
    queryKey: groupKeys.suggestions(),
    queryFn: async () => {
      const result = await getSuggestedColleges(limit);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
  });
}

// Mutation: Join Group (Create Link Request)
export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collegeId,
      data,
    }: {
      collegeId: number;
      data: { role: string; enrollmentYear?: number; graduationYear?: number };
    }) => {
      const result = await createLinkRequest(collegeId, data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.requests() });
      queryClient.invalidateQueries({ queryKey: groupKeys.suggestions() });
    },
  });
}

// Mutation: Cancel Request
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const result = await cancelLinkRequest(requestId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (requestId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: groupKeys.requests() });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData<LinkRequest[]>(
        groupKeys.requests(),
      );

      // Optimistically update
      if (previousRequests) {
        queryClient.setQueryData<LinkRequest[]>(
          groupKeys.requests(),
          (old) => old?.filter((req) => req.id !== requestId) ?? [],
        );
      }

      return { previousRequests };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(
          groupKeys.requests(),
          context.previousRequests,
        );
      }
    },
    onSettled: () => {
      // Mark as stale but don't force immediate refetch to avoid flicker
      // The optimistic update already handled the UI
      queryClient.invalidateQueries({
        queryKey: groupKeys.requests(),
        refetchType: "none",
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.suggestions() });
    },
  });
}

// Mutation: Follow College
export function useFollowGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collegeId: number) => {
      const result = await followCollege(collegeId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      // Invalidate feed or suggestions if needed
      // queryClient.invalidateQueries({ queryKey: groupKeys.suggestions() });
    },
  });
}
