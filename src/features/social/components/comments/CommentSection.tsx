// Comment Section Component
// LinkedIn-style inline comment input with comments list

"use client";

import { useState } from "react";
import {
  Loader2,
  MessageCircle,
  Smile,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useFlattenedComments,
  useCreateComment,
} from "../../hooks/use-comments";
import { useFeedStore } from "../../stores/feed-store"; // Added
import { CommentItem } from "./CommentItem";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { requireAuth } from "../../utils/auth-redirect";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  className?: string;
}

export function CommentSection({
  postId,
  currentUserId,
  className,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { data: session } = useSession();
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor); // Added

  const {
    comments,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isEmpty,
  } = useFlattenedComments(postId);

  const createComment = useCreateComment(postId);

  const MAX_CHARS = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth(session?.user)) return;

    if (!newComment.trim() || newComment.length > MAX_CHARS) return;

    await createComment.mutateAsync({
      content: newComment.trim(),
      authorType: reactionAuthor?.type,
      collegeId:
        reactionAuthor?.type === "college"
          ? parseInt(reactionAuthor.id)
          : undefined,
    });
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      // Allow submit if content is present AND within limit
      if (newComment.trim() && newComment.length <= MAX_CHARS) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className={cn("pb-4", className)}>
      {/* LinkedIn-style Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <div className="flex-1 bg-muted rounded-2xl overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
          {/* Text Input */}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={newComment ? 3 : 1}
            className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground focus:border-none"
          />

          {/* Bottom row with icons and button */}
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {newComment.length > 200 && (
                <span
                  className={cn(
                    "text-xs",
                    newComment.length > MAX_CHARS
                      ? "text-destructive font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {MAX_CHARS - newComment.length}
                </span>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={
                  !newComment.trim() ||
                  newComment.length > MAX_CHARS ||
                  createComment.isPending
                }
                className="rounded-full px-4"
              >
                {createComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isEmpty ? (
        <div className="text-center py-8">
          <MessageCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))}

          {hasNextPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full text-primary hover:text-primary"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Load more comments
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
