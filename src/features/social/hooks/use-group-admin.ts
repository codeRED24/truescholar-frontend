"use client";

// Hooks for group admin actions: manage members, requests, invitations, settings

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  updateGroup,
  deleteGroup,
  updateMemberRole,
  removeMember,
  transferOwnership,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  inviteUser,
  getGroupInvitations,
  cancelInvitation,
} from "../api/groups-api";
import { type UpdateGroupDto, type GroupRole, isApiError } from "../types";
import { groupDetailKeys } from "./use-group-detail";
import { groupListKeys } from "./use-groups-list";

// ============================================================================
// Query Keys
// ============================================================================

export const groupAdminKeys = {
  requests: (groupId: string) =>
    ["groups", "admin", groupId, "requests"] as const,
  invitations: (groupId: string) =>
    ["groups", "admin", groupId, "invitations"] as const,
};

// ============================================================================
// Update Group Settings
// ============================================================================

export function useUpdateGroup(slugId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateGroupDto) => {
      const result = await updateGroup(slugId, data);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(slugId),
      });
    },
  });
}

// ============================================================================
// Delete Group
// ============================================================================

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const result = await deleteGroup(groupId);
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
// Member Role Management
// ============================================================================

export function useUpdateMemberRole(slugId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: GroupRole }) => {
      const result = await updateMemberRole(slugId, userId, role);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.members(slugId),
      });
    },
  });
}

export function useRemoveMember(slugId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await removeMember(slugId, userId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.members(slugId),
      });
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(slugId),
      });
    },
  });
}

export function useTransferOwnership(slugId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOwnerId: string) => {
      const result = await transferOwnership(slugId, newOwnerId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(slugId),
      });
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.members(slugId),
      });
    },
  });
}

// ============================================================================
// Join Requests
// ============================================================================

export function useJoinRequests(groupId: string) {
  return useInfiniteQuery({
    queryKey: groupAdminKeys.requests(groupId),
    queryFn: async ({ pageParam }) => {
      const result = await getJoinRequests(groupId, {
        status: "pending",
        cursor: pageParam,
      });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!groupId,
  });
}

export function useApproveJoinRequest(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const result = await approveJoinRequest(groupId, requestId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupAdminKeys.requests(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.members(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupDetailKeys.detail(groupId),
      });
    },
  });
}

export function useRejectJoinRequest(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const result = await rejectJoinRequest(groupId, requestId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: groupAdminKeys.requests(groupId),
      });
    },
  });
}

// ============================================================================
// Invitations
// ============================================================================

export function useGroupInvitations(groupId: string) {
  return useQuery({
    queryKey: groupAdminKeys.invitations(groupId),
    queryFn: async () => {
      const result = await getGroupInvitations(groupId, { status: "pending" });
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    enabled: !!groupId,
  });
}

export function useInviteUser(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await inviteUser(groupId, userId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupAdminKeys.invitations(groupId),
      });
    },
  });
}

export function useCancelInvitation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await cancelInvitation(groupId, invitationId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupAdminKeys.invitations(groupId),
      });
    },
  });
}
