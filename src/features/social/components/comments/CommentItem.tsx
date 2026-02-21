// Comment Item Component
// Single comment display with lazy-loaded nested replies

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ThumbsUp,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, formatCount } from "../../utils/formatters";
import {
  useToggleCommentLike,
  useDeleteComment,
  useCreateComment,
  useReplies,
} from "../../hooks/use-comments";
import { useFeedStore } from "../../stores/feed-store"; // Added
import type { Comment } from "../../types";
import { cn } from "@/lib/utils";
import { getUserProfilePath } from "../../utils/author-navigation";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  className?: string;
  depth?: number;
}

const MAX_DEPTH = 2; // Max nesting level for replies

export function CommentItem({
  comment,
  postId,
  currentUserId,
  className,
  depth = 0,
}: CommentItemProps) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const reactionAuthor = useFeedStore((s) => s.reactionAuthor); // Added

  const toggleLike = useToggleCommentLike(postId);
  const deleteComment = useDeleteComment(postId);
  const createComment = useCreateComment(postId);

  // Lazy-load replies only when user clicks to view them
  const {
    data: replies,
    isLoading: isLoadingReplies,
    refetch: refetchReplies,
  } = useReplies(postId, comment.id, { enabled: showReplies });

  const isOwner = currentUserId === comment.author.id;
  const initials = comment.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasReplies = comment.replyCount > 0;
  const canReply = depth < MAX_DEPTH;

  const handleAuthorClick = () => {
    if (!comment.author.handle) return;
    router.push(getUserProfilePath(comment.author.handle));
  };

  const handleLike = () => {
    toggleLike.mutate({
      commentId: comment.id,
      isLiked: comment.hasLiked,
      parentId: comment.parentId || undefined,
      authorType: reactionAuthor?.type,
      collegeId:
        reactionAuthor?.type === "college"
          ? parseInt(reactionAuthor.id)
          : undefined,
    });
  };

  const handleDelete = () => {
    deleteComment.mutate(comment.id);
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const MAX_CHARS = 300;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || replyContent.length > MAX_CHARS) return;

    await createComment.mutateAsync({
      content: replyContent.trim(),
      parentId: comment.id,
      authorType: reactionAuthor?.type,
      collegeId:
        reactionAuthor?.type === "college"
          ? parseInt(reactionAuthor.id)
          : undefined,
    });
    setReplyContent("");
    setShowReplyForm(false);
    setShowReplies(true);
    // Refetch replies to include the new one
    refetchReplies();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      // Allow submit if content is present AND within limit
      if (replyContent.trim() && replyContent.length <= MAX_CHARS) {
        handleReplySubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className={cn("group", className)}>
      <div className="flex gap-3">
        <Avatar
          className={cn(
            "shrink-0 cursor-pointer hover:opacity-80 transition-opacity",
            depth === 0 ? "h-10 w-10" : "h-8 w-8"
          )}
          onClick={handleAuthorClick}
        >
          <AvatarImage src={comment.author.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div className="bg-muted rounded-2xl px-4 py-2.5 inline-block max-w-full">
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-sm hover:underline cursor-pointer"
                onClick={handleAuthorClick}
              >
                {comment.author.name}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap wrap-break-word mt-0.5">
              {comment.content}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-1 mt-1 ml-1">
            <button
              onClick={handleLike}
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded hover:bg-muted transition-colors flex items-center gap-1",
                comment.hasLiked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Like
              {comment.likeCount > 0 && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
                  <span>{formatCount(comment.likeCount)}</span>
                </>
              )}
            </button>

            {canReply && (
              <>
                <span className="text-muted-foreground">·</span>
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
                >
                  Reply
                </button>
              </>
            )}

            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>

            {/* Owner actions */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Toggle replies button */}
          {hasReplies && (
            <button
              onClick={handleToggleReplies}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-2 ml-1"
            >
              {showReplies ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
              {showReplies ? "Hide" : "View"} {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}

          {/* Inline reply form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply to ${
                    comment.author.name.split(" ")[0]
                  }...`}
                  className="min-h-[50px] text-sm resize-none rounded-2xl"
                  autoFocus
                />
                <div className="flex gap-2 justify-end items-center">
                  {replyContent.length > 200 && (
                    <span
                      className={cn(
                        "text-xs",
                        replyContent.length > MAX_CHARS
                          ? "text-destructive font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {MAX_CHARS - replyContent.length}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      !replyContent.trim() ||
                      replyContent.length > MAX_CHARS ||
                      createComment.isPending
                    }
                  >
                    {createComment.isPending && (
                      <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    )}
                    Reply
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Nested replies - lazy loaded */}
          {showReplies && (
            <div className="mt-3 space-y-3 border-l-2 border-muted pl-3">
              {isLoadingReplies ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Loading replies...</span>
                </div>
              ) : replies && replies.length > 0 ? (
                replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId}
                    currentUserId={currentUserId}
                    depth={depth + 1}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">
                  No replies yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
