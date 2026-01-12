// Post Actions Component
// Like, comment, share buttons

"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCount } from "../../utils/formatters";
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
    <div className={cn("flex items-center gap-1", className)}>
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLike}
        disabled={isLiking}
        className={cn(
          "gap-1.5 px-3 hover:text-destructive hover:bg-destructive/10",
          hasLiked && "text-destructive"
        )}
      >
        <Heart className={cn("h-5 w-5", hasLiked && "fill-current")} />
        {likeCount > 0 && (
          <span className="text-sm">{formatCount(likeCount)}</span>
        )}
      </Button>

      {/* Comment Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => toggleExpandedComments(postId)}
        className="gap-1.5 px-3 hover:text-primary hover:bg-primary/10"
      >
        <MessageCircle className="h-5 w-5" />
        {commentCount > 0 && (
          <span className="text-sm">{formatCount(commentCount)}</span>
        )}
      </Button>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-1.5 px-3 hover:text-primary hover:bg-primary/10"
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
