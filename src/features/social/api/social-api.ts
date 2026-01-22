// Social API Client
// Uses real API with fallback to mock data for development

import type {
  Post,
  FeedResponse,
  CreatePostDto,
  UpdatePostDto,
  Comment,
  CommentsResponse,
  CreateCommentDto,
  ApiResponse,
  EntityHandle,
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
// Feed API
// ============================================================================

export async function getFeed(
  cursor?: string,
  limit = 20
): Promise<ApiResponse<FeedResponse>> {
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: getMockFeed(cursor, limit) };
  }

  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  return fetchApi<FeedResponse>(`/feed?${params}`);
}

export async function getGuestFeed(
  cursor?: string,
  limit = 20
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

export async function getPost(postId: string): Promise<ApiResponse<Post>> {
  if (USE_MOCK_DATA) {
    const { items } = getMockFeed();
    const feedItem = items.find(
      (item) => item.type === "post" && item.post.id === postId
    );

    if (feedItem && feedItem.type === "post") {
      return { data: feedItem.post };
    }
    return { error: "Post not found", statusCode: 404 };
  }

  return fetchApi<Post>(`/posts/${postId}`);
}

export async function createPost(
  data: CreatePostDto
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
  data: UpdatePostDto
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
  file: File
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

    const data = await response.json();
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

export async function likePost(postId: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/like`, {
    method: "POST",
    body: JSON.stringify({}), // Empty body required by Fastify when Content-Type is JSON
  });
}


export async function searchHandles(query: string): Promise<ApiResponse<EntityHandle[]>> {
  if (USE_MOCK_DATA) return { data: [] };
  return fetchApi<EntityHandle[]>(`/handles/search?q=${encodeURIComponent(query)}`);
}

export async function unlikePost(postId: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/like`, {
    method: "DELETE",
    body: JSON.stringify({}), // Empty body required by Fastify when Content-Type is JSON
  });
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
  postId: string
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

export async function getFollowStatus(
  userId: string
): Promise<ApiResponse<FollowStatusResponse>> {
  return fetchApi<FollowStatusResponse>(`/followers/status/${userId}`);
}

export async function followUser(
  userId: string
): Promise<
  ApiResponse<{ id: string; followingId: string; createdAt: string }>
> {
  return fetchApi<{ id: string; followingId: string; createdAt: string }>(
    "/followers/follow",
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    }
  );
}

export async function unfollowUser(
  userId: string
): Promise<ApiResponse<{ success: boolean }>> {
  return fetchApi<{ success: boolean }>(`/followers/unfollow/${userId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

// ============================================================================
// Comment API
// ============================================================================

export async function getComments(
  postId: string,
  cursor?: string,
  limit = 10
): Promise<ApiResponse<CommentsResponse>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { data: getMockComments(postId, cursor, limit) };
  }

  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  return fetchApi<CommentsResponse>(`/posts/${postId}/comments?${params}`);
}

export async function createComment(
  postId: string,
  data: CreateCommentDto
): Promise<ApiResponse<Comment>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      content: data.content,
      author: {
        id: "current-user",
        name: "You",
        image: undefined,
      },
      parentId: data.parentId ?? null,
      likeCount: 0,
      hasLiked: false,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { data: newComment };
  }

  return fetchApi<Comment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteComment(
  postId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export async function getReplies(
  postId: string,
  commentId: string,
  limit = 20
): Promise<ApiResponse<Comment[]>> {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetchApi<Comment[]>(
    `/posts/${postId}/comments/${commentId}/replies?${params}`
  );
}

export async function likeComment(
  postId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/comments/${commentId}/like`, {
    method: "POST",
    body: JSON.stringify({}), // Empty body required by Fastify when Content-Type is JSON
  });
}

export async function unlikeComment(
  postId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { data: undefined };
  }

  return fetchApi<void>(`/posts/${postId}/comments/${commentId}/like`, {
    method: "DELETE",
    body: JSON.stringify({}), // Empty body required by Fastify when Content-Type is JSON
  });
}
