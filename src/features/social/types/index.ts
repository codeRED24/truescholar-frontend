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

export interface CollegeInfo {
  college_id: number;
  college_name: string;
  logo_img?: string;
  banner_img?: string;
  short_name?: string;
  member_count?: number;
  slug?: string;
  city_name?: string;
  state_name?: string;
  description?: string;
}

export interface CollegeMember {
  id: string;
  userId: string;
  collegeId: number;
  role: string;
  user: {
    id: string;
    name: string;
    image?: string;
    headline?: string;
  };
  createdAt: string;
}

export interface Member {
  id: string;
  collegeId: number;
  college: CollegeInfo;
  userId: string;
  role: string; // "college_admin" | "student" | "alumni"
  createdAt: string;
}

export interface LinkRequest {
  id: string;
  userId: string;
  collegeId: number;
  college: CollegeInfo;
  status: "pending" | "approved" | "rejected";
  requestedRole: string;
  enrollmentYear?: number;
  graduationYear?: number;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  author: Author;
  authorType?: AuthorType;
  type?: PostType;
  taggedCollegeId?: number;
  taggedCollege?: {
    college_id: number;
    college_name: string;
    logo_img?: string;
    slug?: string;
  };
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
  authorType?: AuthorType;
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

// ============================================================================
// College Profile Types (for /feed/colleges/:slugId page)
// ============================================================================

export interface MutualFollower {
  id: string;
  name: string;
  image: string | null;
}

export interface CollegeProfileInfo {
  id: number;
  name: string;
  shortName: string | null;
  slug: string;
  logo: string | null;
  banner: string | null;
  tagline: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  foundedYear: string | null;
  totalStudents: number | null;
  followerCount: number;
  isFollowing: boolean;
}

export interface CollegeProfileResponse {
  college: CollegeProfileInfo;
  socialProof: {
    mutualFollowers: MutualFollower[];
    totalMutualCount: number;
  };
  group: {
    slugId: string;
    memberCount: number;
  };
}

export interface CollegeStats {
  totalStudents: number | null;
  campusSize: number | null;
  foundedYear: string | null;
  naccGrade: string | null;
}

export interface CollegeAboutResponse {
  overview: string | null;
  highlights: string[];
  stats: CollegeStats;
}

export interface CollegePerson {
  id: string;
  name: string;
  image: string | null;
  handle: string | null;
  role?: string;
}

export interface CollegePeopleResponse {
  people: CollegePerson[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | "post_liked"
  | "post_commented"
  | "comment_liked"
  | "comment_replied"
  | "connection_requested"
  | "connection_accepted"
  | "new_follower"
  | "job_application_received"
  | "application_status_changed"
  | "group_invite_received"
  | "group_join_request_received"
  | "group_join_request_approved"
  | "group_role_updated";

export interface Notification {
  id: string;
  type: NotificationType;
  actor: {
    id: string;
    name: string;
    image?: string;
  };
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  data?: any;
}

// ============================================================================
// Facebook-style Groups Types
// ============================================================================

export * from "./groups";
export * from "./events";
