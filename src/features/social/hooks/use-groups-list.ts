"use client";

// Hooks for groups listing, discovery, and user's groups

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getGroups,
  getMyGroups,
  createGroup,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from "../api/groups-api";
import {
  type GroupListParams,
  type CreateGroupDto,
  type InvitationsResponse,
  isApiError,
} from "../types";

// ============================================================================
// Query Keys
// ============================================================================

export const groupListKeys = {
  all: ["groups"] as const,
  lists: () => [...groupListKeys.all, "list"] as const,
  list: (params?: GroupListParams) =>
    [...groupListKeys.lists(), params] as const,
  myGroups: () => [...groupListKeys.all, "my-groups"] as const,
  invitations: () => [...groupListKeys.all, "invitations"] as const,
};

// ============================================================================
// Browse/Discover Groups (Infinite)
// ============================================================================

export function useGroups(params?: Omit<GroupListParams, "cursor">) {
  return useInfiniteQuery({
    queryKey: groupListKeys.list(params),
    queryFn: async ({ pageParam }) => {
      const result = await getGroups({ ...params, cursor: pageParam });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// ============================================================================
// My Groups (Infinite)
// ============================================================================

export function useMyGroups(limit = 20) {
  return useInfiniteQuery({
    queryKey: groupListKeys.myGroups(),
    queryFn: async ({ pageParam }) => {
      const result = await getMyGroups({ limit, cursor: pageParam });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================================================
// My Invitations
// ============================================================================

export function useMyInvitations() {
  return useQuery({
    queryKey: groupListKeys.invitations(),
    queryFn: async () => {
      const result = await getMyInvitations();
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ============================================================================
// Create Group Mutation
// ============================================================================

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupDto) => {
      const result = await createGroup(data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupListKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: groupListKeys.lists() });
    },
  });
}

// ============================================================================
// Accept/Decline Invitation Mutations
// ============================================================================

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await acceptInvitation(invitationId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupListKeys.invitations() });
      queryClient.invalidateQueries({ queryKey: groupListKeys.myGroups() });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await declineInvitation(invitationId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (invitationId) => {
      await queryClient.cancelQueries({
        queryKey: groupListKeys.invitations(),
      });
      const previous = queryClient.getQueryData<InvitationsResponse>(
        groupListKeys.invitations(),
      );
      if (previous) {
        queryClient.setQueryData<InvitationsResponse>(
          groupListKeys.invitations(),
          {
            ...previous,
            invitations: previous.invitations.filter(
              (i) => i.id !== invitationId,
            ),
          },
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          groupListKeys.invitations(),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupListKeys.invitations() });
    },
  });
}
