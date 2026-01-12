// Comment Section Component
// Displays comments for a post with nested replies

"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useFlattenedComments,
  useCreateComment,
} from "../../hooks/use-comments";
import { CommentItem } from "./CommentItem";
import { cn } from "@/lib/utils";

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

  const {
    comments,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isEmpty,
  } = useFlattenedComments(postId);

  const createComment = useCreateComment(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment.mutateAsync({ content: newComment.trim() });
    setNewComment("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[60px] resize-none rounded-2xl"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={!newComment.trim() || createComment.isPending}
            >
              {createComment.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Post
            </Button>
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
        <div className="space-y-4">
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
