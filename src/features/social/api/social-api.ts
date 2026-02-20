// Social API Client
// Uses real API with fallback to mock data for development

import {
  type Post,
  type FeedResponse,
  type CreatePostDto,
  type UpdatePostDto,
  type Comment,
  type CommentsResponse,
  type CreateCommentDto,
  type ApiResponse,
  type EntityHandle,
  type Member,
  type CollegeMember,
  type LinkRequest,
  type CollegeInfo,
  isApiError,
} from "../types";
import { getMockFeed, getMockComments } from "../mocks/feed-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Set to true to always use mock data (useful during development)
const USE_MOCK_DATA = false;

// ============================================================================
// Helper Functions
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
// Feed API
// ============================================================================

export async function getFeed(params: {
  cursor?: string;
  limit?: number;
  authorType?: string;
  collegeId?: number;
}): Promise<ApiResponse<FeedResponse>> {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: getMockFeed(params.cursor, params.limit) };
  }

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 20),
  });
  if (params.cursor) queryParams.set("cursor", params.cursor);
  if (params.authorType) queryParams.set("authorType", params.authorType);
  if (params.collegeId) queryParams.set("collegeId", String(params.collegeId));

  return fetchApi<FeedResponse>(`/feed?${queryParams}`);
}

export async function getGuestFeed(
  cursor?: string,
  limit = 20,
): Promise<ApiResponse<FeedResponse>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: getMockFeed(cursor, limit) };
  }

  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  return fetchApi<FeedResponse>(`/feed/guest?${params}`);
}

// ============================================================================
// Post API
// ============================================================================

export async function getPost(
  postId: string,
  options?: { authorType?: string; collegeId?: number },
): Promise<ApiResponse<Post>> {
  if (USE_MOCK_DATA) {
    const { items } = getMockFeed();
    const feedItem = items.find(
      (item) => item.type === "post" && item.post.id === postId,
    );

    if (feedItem && feedItem.type === "post") {
      return { data: feedItem.post };
    }
    return { error: "Post not found", statusCode: 404 };
  }

  const queryParams = new URLSearchParams();
  if (options?.authorType) queryParams.set("authorType", options.authorType);
  if (options?.collegeId)
    queryParams.set("collegeId", String(options.collegeId));

  return fetchApi<Post>(`/posts/${postId}?${queryParams}`);
}

export async function createPost(
  data: CreatePostDto,
): Promise<ApiResponse<Post>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newPost: Post = {
      id: `post-${Date.now()}`,
      content: data.content,
      author: {
        id: "current-user",
        name: "You",
        image: undefined,
      },
      media: data.media ?? [],
      visibility: data.visibility ?? "public",
      likeCount: 0,
      commentCount: 0,
      hasLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: newPost };
  }

  // Send as JSON - backend expects PostMediaDto (URLs), not file uploads
  return fetchApi<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  postId: string,
  data: UpdatePostDto,
): Promise<ApiResponse<Post>> {
  return fetchApi<Post>(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePost(postId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

// ============================================================================
// Media Upload API
// ============================================================================

export interface MediaUploadResponse {
  url: string;
  type: "image" | "video" | "document";
}

/**
 * Upload a media file for a post.
 * Returns the URL and type of the uploaded media.
 * The URL should be included in the post's media array when creating/updating.
 */
export async function uploadPostMedia(
  file: File,
): Promise<ApiResponse<MediaUploadResponse>> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/posts/media`, {
      method: "POST",
      body: formData,
      credentials: "include",
      // Note: Don't set Content-Type header - browser sets it with boundary for FormData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error:
          errorData.message || `Upload failed with status ${response.status}`,
        statusCode: response.status,
      };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

// ============================================================================
// Like API
// ============================================================================

interface LikeOptions {
  authorType?: string;
  collegeId?: number;
}

export async function likePost(
  postId: string,
  options?: LikeOptions,
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify(options || {}),
  });
}

export async function unlikePost(
  postId: string,
  options?: LikeOptions,
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/like`, {
    method: "DELETE",
    body: JSON.stringify(options || {}),
  });
}

export async function searchHandles(
  query: string,
): Promise<ApiResponse<EntityHandle[]>> {
  if (USE_MOCK_DATA) return { data: [] };
  return fetchApi<EntityHandle[]>(
    `/handles/search?q=${encodeURIComponent(query)}`,
  );
}

// ============================================================================
// Bookmark API
// ============================================================================

export async function bookmarkPost(postId: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/posts/${postId}/bookmark`, {
    method: "POST",
  });
}

export async function unbookmarkPost(
  postId: string,
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/posts/${postId}/bookmark`, {
    method: "DELETE",
  });
}

// ============================================================================
// Follow API
// ============================================================================

export interface FollowStatusResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

interface FollowOptions {
  authorType?: string;
  followerCollegeId?: number;
}

export async function getFollowStatus(
  userId: string,
): Promise<ApiResponse<FollowStatusResponse>> {
  return fetchApi<FollowStatusResponse>(`/followers/status/${userId}`);
}

export async function followUser(
  userId: string,
  options?: FollowOptions,
): Promise<
  ApiResponse<{ id: string; followingId: string; createdAt: string }>
> {
  return fetchApi<{ id: string; followingId: string; createdAt: string }>(
    "/followers/follow",
    {
      method: "POST",
      body: JSON.stringify({ userId, ...options }),
    },
  );
}

export async function unfollowUser(
  userId: string,
  options?: FollowOptions,
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi<{ success: boolean }>(`/followers/unfollow/${userId}`, {
    method: "DELETE",
    body: JSON.stringify(options || {}),
  });
}

export async function followCollege(
  collegeId: number,
  options?: FollowOptions,
): Promise<ApiResponse<{ id: string; collegeId: number; createdAt: string }>> {
  return fetchApi<{ id: string; collegeId: number; createdAt: string }>(
    "/followers/follow/college",
    {
      method: "POST",
      body: JSON.stringify({ collegeId, ...options }),
    },
  );
}

export async function unfollowCollege(
  collegeId: number,
  options?: FollowOptions,
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi<{ success: boolean }>(
    `/followers/unfollow/college/${collegeId}`,
    {
      method: "DELETE",
      body: JSON.stringify(options || {}),
    },
  );
}

// ============================================================================
// College Membership API
// ============================================================================

export async function getMyCollegeMemberships(): Promise<
  ApiResponse<Member[]>
> {
  if (USE_MOCK_DATA) return { data: [] };
  // Fetch actual memberships where the user is a member
  return fetchApi<Member[]>("/memberships/me");
}

export async function getMyRequests(): Promise<ApiResponse<LinkRequest[]>> {
  if (USE_MOCK_DATA) return { data: [] };
  return fetchApi<LinkRequest[]>("/colleges/my-requests");
}

export async function createLinkRequest(
  collegeId: number,
  data: { role: string; enrollmentYear?: number; graduationYear?: number },
): Promise<ApiResponse<LinkRequest>> {
  return fetchApi<LinkRequest>(`/colleges/${collegeId}/link-request`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelLinkRequest(
  requestId: string,
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/colleges/requests/${requestId}`, {
    method: "DELETE",
  });
}

export async function getSuggestedColleges(
  limit = 5,
): Promise<ApiResponse<CollegeInfo[]>> {
  // Use dedicated suggestions API which returns correct format and member count
  const response = await fetchApi<CollegeInfo[]>(
    `/college-info/suggestions?limit=${limit}`,
  );

  return response;
}

export async function getCollegeInfo(
  collegeId: number,
): Promise<ApiResponse<CollegeInfo>> {
  return fetchApi<CollegeInfo>(`/college-info/${collegeId}`);
}

export async function getCollegeMembers(
  collegeId: number,
): Promise<ApiResponse<CollegeMember[]>> {
  return fetchApi<CollegeMember[]>(`/college-member/members/${collegeId}`);
}

export async function getComments(
  postId: string,
  cursor?: string,
  limit = 10,
  options?: { authorType?: string; collegeId?: number },
): Promise<ApiResponse<CommentsResponse>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: getMockComments(postId, cursor, limit) };
  }

  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  if (options?.authorType) params.set("authorType", options.authorType);
  if (options?.collegeId) params.set("collegeId", String(options.collegeId));

  return fetchApi<CommentsResponse>(`/posts/${postId}/comments?${params}`);
}

export async function createComment(
  postId: string,
  data: CreateCommentDto & { authorType?: string; collegeId?: number },
): Promise<ApiResponse<Comment>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Mock logic omitted for brevity
    return { data: {} as Comment };
  }

  return fetchApi<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export async function getReplies(
  postId: string,
  commentId: string,
  limit = 20,
  options?: { authorType?: string; collegeId?: number },
): Promise<ApiResponse<Comment[]>> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (options?.authorType) params.set("authorType", options.authorType);
  if (options?.collegeId) params.set("collegeId", String(options.collegeId));

  return fetchApi<Comment[]>(
    `/posts/${postId}/comments/${commentId}/replies?${params}`,
  );
}

export async function likeComment(
  postId: string,
  commentId: string,
  options?: LikeOptions,
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/comments/${commentId}/like`, {
    method: "POST",
    body: JSON.stringify(options || {}),
  });
}

export async function unlikeComment(
  postId: string,
  commentId: string,
  options?: LikeOptions,
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/comments/${commentId}/like`, {
    method: "DELETE",
    body: JSON.stringify(options || {}),
  });
}

// ============================================================================
// College Profile API (/feed/colleges/:slugId)
// ============================================================================

import {
  type CollegeProfileResponse,
  type CollegeAboutResponse,
  type CollegePeopleResponse,
  type GroupFeedResponse,
} from "../types";

export async function getCollegeProfile(
  slugId: string,
): Promise<ApiResponse<CollegeProfileResponse>> {
  return fetchApi<CollegeProfileResponse>(`/colleges/${slugId}`);
}

export async function getCollegeAbout(
  slugId: string,
): Promise<ApiResponse<CollegeAboutResponse>> {
  return fetchApi<CollegeAboutResponse>(`/colleges/${slugId}/about`);
}

export async function getCollegeAlumni(
  slugId: string,
  cursor?: string,
): Promise<ApiResponse<CollegePeopleResponse>> {
  const queryParams = new URLSearchParams({ limit: "10" });
  if (cursor) queryParams.set("cursor", cursor);

  return fetchApi<CollegePeopleResponse>(
    `/colleges/${slugId}/alumni?${queryParams}`,
  );
}

export async function getCollegePosts(
  slugId: string,
  cursor?: string,
  authorType?: string,
  collegeId?: number,
): Promise<ApiResponse<GroupFeedResponse>> {
  const queryParams = new URLSearchParams();
  if (cursor) queryParams.set("cursor", cursor);
  if (authorType) queryParams.set("authorType", authorType);
  if (collegeId) queryParams.set("collegeId", String(collegeId));

  const queryString = queryParams.toString();
  return fetchApi<GroupFeedResponse>(
    `/colleges/${slugId}/posts${queryString ? `?${queryString}` : ""}`
  );
}

