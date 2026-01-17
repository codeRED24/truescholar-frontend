// Post Actions Component
// Like, comment, share buttons - LinkedIn/Facebook style action bar

"use client";

import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikePost } from "../../hooks/use-likes";
import { useFeedStore } from "../../stores/feed-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PostActionsProps {
  postId: string;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  className?: string;
}

export function PostActions({
  postId,
  likeCount,
  commentCount,
  hasLiked,
  className,
}: PostActionsProps) {
  const { toggle: toggleLike, isLoading: isLiking } = useLikePost(
    postId,
    hasLiked
  );
  const toggleExpandedComments = useFeedStore((s) => s.toggleExpandedComments);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`
      );
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className={cn("", className)}>
      {/* Likes count row */}
      {likeCount > 0 && (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </div>
      )}

      {/* Action buttons - evenly spaced */}
      <div className="flex items-center border-t">
        {/* Like Button */}
        <Button
          variant="ghost"
          onClick={toggleLike}
          disabled={isLiking}
          className={cn(
            "flex-1 rounded-none h-11 gap-2 font-medium",
            hasLiked
              ? "text-primary hover:text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsUp className={cn("h-5 w-5", hasLiked && "fill-current")} />
          <span>Like</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          onClick={() => toggleExpandedComments(postId)}
          className="flex-1 rounded-none h-11 gap-2 font-medium text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Comment</span>
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          onClick={handleShare}
          className="flex-1 rounded-none h-11 gap-2 font-medium text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
}
