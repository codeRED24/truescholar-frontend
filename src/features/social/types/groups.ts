// ============================================================================
// Facebook-style Groups Types
// Matches backend DTOs from /groups/* endpoints
// ============================================================================

// ============================================================================
// Enums & Constants
// ============================================================================

export type GroupType = "public" | "private";
export type GroupPrivacy = "visible" | "hidden";
export type GroupRole = "owner" | "admin" | "member";
export type JoinRequestStatus = "pending" | "approved" | "rejected";
export type InvitationStatus = "pending" | "accepted" | "declined";

// ============================================================================
// Core Group Types
// ============================================================================

export interface Group {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: GroupType;
  privacy: GroupPrivacy;
  bannerImage: string | null;
  logoImage: string | null;
  rules: string | null;
  memberCount: number;
  postCount: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isMember?: boolean;
  userRole?: GroupRole | null;
}

export interface GroupDetail extends Group {
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
  hasPendingRequest: boolean;
  hasPendingInvitation: boolean;
}

// ============================================================================
// Membership Types
// ============================================================================

export interface GroupMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  role: GroupRole;
  joinedAt: string;
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  message: string | null;
  status: JoinRequestStatus;
  createdAt: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  group: {
    id: string;
    name: string;
    slug: string;
    logoImage: string | null;
  };
  inviterId: string;
  inviter: {
    id: string;
    name: string;
    image: string | null;
  };
  inviteeId: string;
  invitee: {
    id: string;
    name: string;
    image: string | null;
  };
  status: InvitationStatus;
  createdAt: string;
}

// ============================================================================
// Request/Response DTOs
// ============================================================================

export interface CreateGroupDto {
  name: string;
  description?: string;
  type: GroupType;
  privacy?: GroupPrivacy;
  rules?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  type?: GroupType;
  privacy?: GroupPrivacy;
  rules?: string;
  bannerImage?: string;
  logoImage?: string;
}

export interface GroupListParams {
  search?: string;
  type?: GroupType;
  myGroups?: boolean;
  limit?: number;
  cursor?: string;
}

export interface GroupListResponse {
  groups: Group[];
  total: number;
  nextCursor: string | null;
}

export interface GroupMembersResponse {
  members: GroupMember[];
  total: number;
  nextCursor: string | null;
}

export interface JoinRequestsResponse {
  requests: GroupJoinRequest[];
  total: number;
  nextCursor: string | null;
}

export interface InvitationsResponse {
  invitations: GroupInvitation[];
  total: number;
  nextCursor: string | null;
}

// ============================================================================
// Feed Types
// ============================================================================

export interface GroupFeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  type: string;
  content: string;
  media: Array<{
    url: string;
    type: "image" | "video" | "document";
    thumbnailUrl?: string;
    altText?: string;
  }>;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupFeedResponse {
  posts: GroupFeedPost[];
  total: number;
  nextCursor: string | null;
}

export interface CreateGroupPostDto {
  content: string;
  type?: "general" | "announcement" | "event" | "article";
  media?: Array<{
    url: string;
    type: "image" | "video" | "document";
  }>;
  visibility?: "public" | "group";
}
