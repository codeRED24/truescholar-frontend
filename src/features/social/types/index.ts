// Social Media Module Types
// Core type definitions matching backend DTOs exactly

// ============================================================================
// Author / User Types
// ============================================================================

export interface Author {
  id: string;
  name: string;
  image?: string;
  user_type?: string; // Matches backend FeedAuthorDto
}

// ============================================================================
// Post Types
// ============================================================================

export type PostVisibility = "public" | "followers" | "private" | "college";

export type AuthorType = "user" | "college" | "admin";

export type PostType = "general" | "announcement" | "event" | "article";

export interface PostMedia {
  id?: string; // Optional, generated if not provided
  url: string;
  type: "image" | "video" | "document";
  thumbnailUrl?: string;
  altText?: string;
}

export interface Post {
  id: string;
  content: string;
  author: Author;
  authorType?: AuthorType;
  type?: PostType;
  taggedCollegeId?: number;
  media: PostMedia[];
  visibility: PostVisibility;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  isFollowing?: boolean; // Whether current user follows the post author
  mentions?: EntityHandle[];
  createdAt: string; // ISO date string
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  visibility?: PostVisibility;
  type?: PostType;
  taggedCollegeId?: number;
  // Backend expects PostMediaDto (URLs), not file uploads
  // File upload requires a separate upload endpoint first
  media?: PostMedia[];
}

export interface UpdatePostDto {
  content?: string;
  visibility?: PostVisibility;
}

// ============================================================================
// Comment Types (matches backend comment.entity.ts)
// ============================================================================

export interface Comment {
  id: string;
  postId: string;
  content: string;
  author: Author;
  parentId: string | null;
  likeCount: number;
  hasLiked: boolean;
  replyCount: number; // Computed on frontend
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

// ============================================================================
// Feed Types (matches backend FeedResponseDto)
// ============================================================================

// Suggested user for "Who to follow" cards
export interface FeedSuggestedUser {
  id: string;
  name: string;
  image?: string;
  mutualCount: number;
}

// Union type for heterogeneous feed items
export type FeedItem =
  | { type: "post"; post: Post }
  | { type: "suggestions"; suggestions: FeedSuggestedUser[] };

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface FeedOptions {
  limit?: number;
  type?: "all" | "following" | "trending";
}

// ============================================================================
// Comments Response
// ============================================================================

export interface CommentsResponse {
  comments: Comment[];
  nextCursor: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type guard for API responses
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return "error" in response;
}

export interface EntityHandle {
  id: string;
  handle: string;
  entityType: "user" | "college" | "company";
  entityId: string;
  displayName: string;
  image?: string;
}
