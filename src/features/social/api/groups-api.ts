// Groups API Client
// Handles all /groups/* endpoints for Facebook-style independent groups

import {
  type ApiResponse,
  type Group,
  type GroupDetail,
  type GroupListParams,
  type GroupListResponse,
  type GroupMembersResponse,
  type JoinRequestsResponse,
  type InvitationsResponse,
  type GroupFeedResponse,
  type CreateGroupDto,
  type UpdateGroupDto,
  type CreateGroupPostDto,
  type GroupRole,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ============================================================================
// Helper
// ============================================================================

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.message || `Request failed with status ${response.status}`,
        statusCode: response.status,
      };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Group CRUD
// ============================================================================

export async function createGroup(
  data: CreateGroupDto,
): Promise<ApiResponse<Group>> {
  return fetchApi<Group>("/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getGroups(
  params?: GroupListParams,
): Promise<ApiResponse<GroupListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set("search", params.search);
  if (params?.type) queryParams.set("type", params.type);
  if (params?.myGroups) queryParams.set("myGroups", "true");
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<GroupListResponse>(
    `/groups${queryString ? `?${queryString}` : ""}`,
  );
}

export async function getMyGroups(params?: {
  limit?: number;
  cursor?: string;
}): Promise<ApiResponse<GroupListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<GroupListResponse>(
    `/groups/my-groups${queryString ? `?${queryString}` : ""}`,
  );
}

export async function getGroupById(
  id: string,
): Promise<ApiResponse<GroupDetail>> {
  return fetchApi<GroupDetail>(`/groups/${id}`);
}

export async function updateGroup(
  id: string,
  data: UpdateGroupDto,
): Promise<ApiResponse<Group>> {
  return fetchApi<Group>(`/groups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteGroup(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/groups/${id}`, {
    method: "DELETE",
  });
}

// ============================================================================
// Membership
// ============================================================================

export async function joinGroup(
  id: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${id}/join`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function leaveGroup(
  id: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${id}/leave`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function transferOwnership(
  id: string,
  newOwnerId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${id}/transfer-ownership`, {
    method: "POST",
    body: JSON.stringify({ newOwnerId }),
  });
}

export async function getGroupMembers(
  id: string,
  params?: { role?: GroupRole; limit?: number; cursor?: string },
): Promise<ApiResponse<GroupMembersResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.set("role", params.role);
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<GroupMembersResponse>(
    `/groups/${id}/members${queryString ? `?${queryString}` : ""}`,
  );
}

export async function updateMemberRole(
  groupId: string,
  userId: string,
  role: GroupRole,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/groups/${groupId}/members/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  );
}

export async function removeMember(
  groupId: string,
  userId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
    },
  );
}

// ============================================================================
// Join Requests (Private Groups)
// ============================================================================

export async function requestToJoin(
  id: string,
  message?: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${id}/request-join`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function cancelJoinRequest(
  id: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${id}/request-join`, {
    method: "DELETE",
  });
}

export async function getJoinRequests(
  id: string,
  params?: { status?: string; limit?: number; cursor?: string },
): Promise<ApiResponse<JoinRequestsResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<JoinRequestsResponse>(
    `/groups/${id}/join-requests${queryString ? `?${queryString}` : ""}`,
  );
}

export async function approveJoinRequest(
  groupId: string,
  requestId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/groups/${groupId}/join-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function rejectJoinRequest(
  groupId: string,
  requestId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/groups/${groupId}/join-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

// ============================================================================
// Invitations
// ============================================================================

export async function inviteUser(
  groupId: string,
  userId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/groups/${groupId}/invitations`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function getGroupInvitations(
  groupId: string,
  params?: { status?: string; limit?: number; cursor?: string },
): Promise<ApiResponse<InvitationsResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set("status", params.status);
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<InvitationsResponse>(
    `/groups/${groupId}/invitations${queryString ? `?${queryString}` : ""}`,
  );
}

export async function cancelInvitation(
  groupId: string,
  invitationId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(
    `/groups/${groupId}/invitations/${invitationId}`,
    { method: "DELETE" },
  );
}

export async function getMyInvitations(): Promise<
  ApiResponse<InvitationsResponse>
> {
  return fetchApi<InvitationsResponse>("/group-invitations");
}

export async function acceptInvitation(
  invitationId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/group-invitations/${invitationId}/accept`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function declineInvitation(
  invitationId: string,
): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/group-invitations/${invitationId}/decline`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// ============================================================================
// Group Feed
// ============================================================================

export async function getGroupFeed(
  id: string,
  params?: { limit?: number; cursor?: string },
): Promise<ApiResponse<GroupFeedResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set("limit", String(params.limit));
  if (params?.cursor) queryParams.set("cursor", params.cursor);

  const queryString = queryParams.toString();
  return fetchApi<GroupFeedResponse>(
    `/groups/${id}/feed${queryString ? `?${queryString}` : ""}`,
  );
}

export async function createGroupPost(
  id: string,
  data: CreateGroupPostDto,
): Promise<ApiResponse<{ id: string; message: string }>> {
  return fetchApi<{ id: string; message: string }>(`/groups/${id}/posts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
