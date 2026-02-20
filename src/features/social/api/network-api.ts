// Network API Client
// API functions for followers and suggestions (Twitter-style follow model)

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
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

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// ============================================================================
// Types
// ============================================================================

export interface NetworkUser {
  id: string;
  name: string;
  image: string | null;
  headline?: string;
  user_type?: string;
}

export interface FollowEntry {
  id: string;
  createdAt: string;
  user: NetworkUser;
}

export interface SuggestedUser {
  id: string;
  name: string;
  image: string | null;
  mutualCount: number; // Mutual follows
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  followingCollegesCount: number;
}

// ============================================================================
// Suggestions API
// ============================================================================

export async function getSuggestions(
  limit = 20
): Promise<ApiResponse<SuggestedUser[]>> {
  return fetchApi<SuggestedUser[]>(`/followers/suggestions?limit=${limit}`);
}

// ============================================================================
// Followers/Following API
// ============================================================================

export async function getFollowers(
  page = 1,
  limit = 20
): Promise<ApiResponse<FollowEntry[]>> {
  return fetchApi<FollowEntry[]>(`/followers?page=${page}&limit=${limit}`);
}

export async function getFollowing(
  page = 1,
  limit = 20
): Promise<ApiResponse<FollowEntry[]>> {
  return fetchApi<FollowEntry[]>(
    `/followers/following?page=${page}&limit=${limit}`
  );
}

export async function getFollowerStats(): Promise<ApiResponse<FollowStats>> {
  return fetchApi<FollowStats>(`/followers/stats`);
}

export async function followUser(
  userId: string
): Promise<ApiResponse<{ id: string }>> {
  return fetchApi<{ id: string }>("/followers/follow", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function unfollowUser(
  userId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi<{ success: boolean }>(`/followers/unfollow/${userId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}
