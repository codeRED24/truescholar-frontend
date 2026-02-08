"use client";

// Hooks for single group page: profile, feed, membership actions

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getGroupById,
  getGroupMembers,
  getGroupFeed,
  createGroupPost,
  joinGroup,
  leaveGroup,
  requestToJoin,
  cancelJoinRequest,
} from "../api/groups-api";
import {
  type GroupDetail,
  type CreateGroupPostDto,
  type GroupRole,
  type GroupFeedResponse,
  isApiError,
} from "../types";
import { toast } from "sonner";
import { groupListKeys } from "./use-groups-list";

// ============================================================================
// Query Keys
// ============================================================================

export const groupDetailKeys = {
  all: ["groups", "detail"] as const,
  detail: (id: string) => [...groupDetailKeys.all, id] as const,
  members: (id: string, role?: GroupRole) =>
    [...groupDetailKeys.all, id, "members", role] as const,
  feed: (id: string) => [...groupDetailKeys.all, id, "feed"] as const,
};

// ============================================================================
// Group Profile Query
// ============================================================================

export function useGroupDetail(id: string) {
  return useQuery({
    queryKey: groupDetailKeys.detail(id),
    queryFn: async () => {
      const result = await getGroupById(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================================
// Group Members Query (Infinite)
// ============================================================================

export function useGroupMembers(
  id: string,
  options?: { role?: GroupRole; limit?: number },
) {
  return useInfiniteQuery({
    queryKey: groupDetailKeys.members(id, options?.role),
    queryFn: async ({ pageParam }) => {
      const result = await getGroupMembers(id, {
        role: options?.role,
        limit: options?.limit || 20,
        cursor: pageParam,
      });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!id,
  });
}

// ============================================================================
// Group Feed Query (Infinite)
// ============================================================================

export function useGroupFeed(id: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: groupDetailKeys.feed(id),
    queryFn: async ({ pageParam }) => {
      const result = await getGroupFeed(id, { limit, cursor: pageParam });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================================================
// Create Post in Group
// ============================================================================

export function useCreateGroupPost(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupPostDto) => {
      const result = await createGroupPost(id, data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (newPost) => {
      // Optimistically update feed
      queryClient.setQueryData(
        groupDetailKeys.feed(id),
        (oldData: { pages: GroupFeedResponse[]; pageParams: any[] } | undefined) => {
          if (!oldData) return oldData;
          
          const newPages = [...oldData.pages];
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              posts: [newPost, ...newPages[0].posts],
            };
          }
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      toast.success("Post created!");
    },
  });
}

// ============================================================================
// Join Group (Public)
// ============================================================================

export function useJoinGroup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await joinGroup(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      const previous = queryClient.getQueryData<GroupDetail>(
        groupDetailKeys.detail(id),
      );
      if (previous) {
        queryClient.setQueryData<GroupDetail>(groupDetailKeys.detail(id), {
          ...previous,
          userRole: "member",
          isMember: true,
          memberCount: previous.memberCount + 1,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          groupDetailKeys.detail(id),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: groupListKeys.myGroups() });
    },
  });
}

// ============================================================================
// Leave Group
// ============================================================================

export function useLeaveGroup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await leaveGroup(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      const previous = queryClient.getQueryData<GroupDetail>(
        groupDetailKeys.detail(id),
      );
      if (previous) {
        queryClient.setQueryData<GroupDetail>(groupDetailKeys.detail(id), {
          ...previous,
          userRole: null,
          isMember: false,
          memberCount: Math.max(0, previous.memberCount - 1),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          groupDetailKeys.detail(id),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: groupListKeys.myGroups() });
    },
  });
}

// ============================================================================
// Request to Join (Private Groups)
// ============================================================================

export function useRequestToJoin(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message?: string) => {
      const result = await requestToJoin(id, message);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      const previous = queryClient.getQueryData<GroupDetail>(
        groupDetailKeys.detail(id),
      );
      if (previous) {
        queryClient.setQueryData<GroupDetail>(groupDetailKeys.detail(id), {
          ...previous,
          hasPendingRequest: true,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          groupDetailKeys.detail(id),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(id),
      });
    },
  });
}

// ============================================================================
// Cancel Join Request
// ============================================================================

export function useCancelJoinRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await cancelJoinRequest(id);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: groupDetailKeys.detail(id),
      });
      const previous = queryClient.getQueryData<GroupDetail>(
        groupDetailKeys.detail(id),
      );
      if (previous) {
        queryClient.setQueryData<GroupDetail>(groupDetailKeys.detail(id), {
          ...previous,
          hasPendingRequest: false,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          groupDetailKeys.detail(id),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(id),
      });
    },
  });
}
