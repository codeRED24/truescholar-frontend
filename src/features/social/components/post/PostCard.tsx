// Post Card Component
// Main display component for a single post

"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Flag,
  Trash2,
  Edit,
  Link2,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthorHeader } from "../shared/AuthorHeader";
import { MediaGallery } from "../shared/MediaGallery";
import { PostActions } from "./PostActions";
import { CommentSection } from "../comments/CommentSection";
import { useFeedStore } from "../../stores/feed-store";
import {
  followUser,
  unfollowUser,
  followCollege,
  unfollowCollege,
} from "../../api/social-api";
import { renderContentWithMentions } from "../../utils/mention-utils";
import { Author, Post } from "../../types";
import { isApiError } from "../../types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type PostCardVariant = "default" | "compact" | "detail";

interface PostCardProps {
  post: Post;
  variant?: PostCardVariant;
  currentUserId?: string;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onAuthorClick?: (authorId: string, type?: "user" | "college") => void;
  className?: string;
  groupId?: string;
}

export function PostCard({
  post,
  variant = "default",
  currentUserId,
  onEdit,
  onDelete,
  onReport,
  onAuthorClick,
  className,
  groupId,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(variant === "detail");
  const [isFollowing, setIsFollowing] = useState(post.isFollowing ?? false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const isCommentsExpanded = useFeedStore((s) => s.isCommentsExpanded(post.id));
  const shouldShowComments = variant === "detail" || isCommentsExpanded;
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);

  const isCollegePost = post.authorType === "college" && !!post.taggedCollege;
  const isOwner = currentUserId === post.author.id; // User is still the creator
  const shouldTruncate = variant !== "detail" && post.content.length > 280;
  const displayContent =
    shouldTruncate && !isExpanded
      ? post.content.slice(0, 280) + "…"
      : post.content;

  // Determine display author (User or College)
  const displayAuthor: Author = isCollegePost
    ? {
        id: post.taggedCollege!.slug
          ? `${post.taggedCollege!.slug}-${post.taggedCollege!.college_id}`
          : post.taggedCollege!.college_id.toString(),
        name: post.taggedCollege!.college_name,
        image: post.taggedCollege!.logo_img,
        user_type: "college",
      }
    : post.author;

  const subtitle = isCollegePost 
    ? undefined
    : post.author.user_type 
        ? post.author.user_type.charAt(0).toUpperCase() + post.author.user_type.slice(1)
        : undefined;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowLoading) return;

    setIsFollowLoading(true);
    const wasFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!wasFollowing);

    const followOptions =
      reactionAuthor?.type === "college"
        ? {
            authorType: "college",
            followerCollegeId: parseInt(reactionAuthor.id),
          }
        : undefined;

    try {
      if (wasFollowing) {
        let error: string | undefined;

        if (isCollegePost) {
          const result = await unfollowCollege(
            post.taggedCollege!.college_id,
            followOptions
          );
          if (isApiError(result)) error = result.error;
        } else {
          const result = await unfollowUser(post.author.id, followOptions);
          if (isApiError(result)) error = result.error;
        }

        if (error) {
          setIsFollowing(true); // Revert on error
          toast.error(error || "Failed to unfollow");
        } else {
          toast.success(`Unfollowed ${displayAuthor.name}`);
        }
      } else {
        let error: string | undefined;

        if (isCollegePost) {
          const result = await followCollege(
            post.taggedCollege!.college_id,
            followOptions
          );
          if (isApiError(result)) error = result.error;
        } else {
          const result = await followUser(post.author.id, followOptions);
          if (isApiError(result)) error = result.error;
        }

        if (error) {
          setIsFollowing(false); // Revert on error
          toast.error(error || "Failed to follow");
        } else {
          toast.success(`Following ${displayAuthor.name}`);
        }
      }
    } catch {
      setIsFollowing(wasFollowing); // Revert on error
      toast.error("Something went wrong");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const query = groupId ? `?groupId=${encodeURIComponent(groupId)}` : "";
      const url = `${window.location.origin}/feed/post/${post.id}${query}`;
      
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className={cn("p-4 pb-0", variant === "compact" && "p-3")}>
        {/* Header */}
        <div className="flex items-start mb-3">
          <AuthorHeader
            author={displayAuthor}
            createdAt={post.createdAt}
            size={variant === "compact" ? "sm" : "md"}
            subtitle={subtitle}
            showBadge={false}
            onClick={() =>
              onAuthorClick?.(
                displayAuthor.id,
                isCollegePost ? "college" : "user"
              )
            }
          />

          <div className="ml-auto flex items-center">
            {!isOwner && currentUserId && !isFollowing && !groupId && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-1 h-8 font-semibold px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={handleFollow}
                disabled={isFollowLoading}
              >
                {isFollowLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "+ Follow"
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy link
                </DropdownMenuItem>

                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit?.(post)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(post.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}

                {!isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onReport?.(post.id)}
                      className="text-destructive"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="whitespace-pre-wrap wrap-break-word">
            {renderContentWithMentions(displayContent, post.mentions)}
          </p>
          {shouldTruncate && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-primary text-sm font-medium hover:underline"
            >
              See more
            </button>
          )}
        </div>

        {/* Media */}
        {post.media.length > 0 && (
          <MediaGallery media={post.media} className="mb-3" />
        )}

        {/* Post Type Badge (for announcements, events, etc.) */}
        {post.type && post.type !== "general" && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
              {post.type}
            </span>
          </div>
        )}

        {/* Actions */}
        <PostActions
          postId={post.id}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          hasLiked={post.hasLiked}
          groupId={groupId}
          className=""
        />

        {/* Comments Section (expandable) */}
        {shouldShowComments && (
          <CommentSection postId={post.id} className="mt-4" />
        )}
      </CardContent>
    </Card>
  );
}
