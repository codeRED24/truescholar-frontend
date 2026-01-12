// Post Card Component
// Main display component for a single post

"use client";

import { useState } from "react";
import { MoreHorizontal, Flag, Trash2, Edit, Link2 } from "lucide-react";
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
import type { Post } from "../../types";
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
  onAuthorClick?: (authorId: string) => void;
  className?: string;
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
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(variant === "detail");
  const isCommentsExpanded = useFeedStore((s) => s.isCommentsExpanded(post.id));

  const isOwner = currentUserId === post.author.id;
  const shouldTruncate = variant !== "detail" && post.content.length > 280;
  const displayContent =
    shouldTruncate && !isExpanded
      ? post.content.slice(0, 280) + "…"
      : post.content;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className={cn("border-0 shadow-none", className)}>
      <CardContent className={cn("p-4", variant === "compact" && "p-3")}>
        {/* Header */}
        <div className="flex items-start mb-3">
          <AuthorHeader
            author={post.author}
            createdAt={post.createdAt}
            size={variant === "compact" ? "sm" : "md"}
            onClick={() => onAuthorClick?.(post.author.id)}
          />

          {!isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto mr-1 h-8 text-primary hover:text-primary/80 hover:bg-primary/10 font-semibold px-2"
              onClick={(e) => {
                e.stopPropagation();
                toast.success(`Followed ${post.author.name}`);
              }}
            >
              + Follow
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-muted-foreground",
                  isOwner && "ml-auto"
                )}
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

        {/* Content */}
        <div className="mb-3">
          <p className="whitespace-pre-wrap break-words">{displayContent}</p>
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
          className="border-t pt-3"
        />

        {/* Comments Section (expandable) */}
        {isCommentsExpanded && (
          <CommentSection postId={post.id} className="mt-4 border-t pt-4" />
        )}
      </CardContent>
    </Card>
  );
}
