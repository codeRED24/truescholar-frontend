// Post Actions Component
// Like, comment, share buttons - LinkedIn/Facebook style action bar

"use client";

import { useState } from "react";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikePost } from "../../hooks/use-likes";
import { useFeedStore } from "../../stores/feed-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReactionAuthorSelector } from "./ReactionAuthorSelector";
import { PostLikesModal } from "./PostLikesModal";
import { useSession } from "@/lib/auth-client";
import { redirectToSigninWithReturn } from "@/lib/auth-redirect";

interface PostActionsProps {
  postId: string;
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  className?: string;
  onCommentClick?: (postId: string) => void;
}

export function PostActions({
  postId,
  likeCount,
  commentCount,
  hasLiked,
  className,
  onCommentClick,
}: PostActionsProps) {
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const safeLikeCount = Number.isFinite(Number(likeCount))
    ? Number(likeCount)
    : 0;
  const safeCommentCount = Number.isFinite(Number(commentCount))
    ? Number(commentCount)
    : 0;

  const { data: session } = useSession();
  const { toggle: toggleLike, isLoading: isLiking } = useLikePost(
    postId,
    hasLiked
  );
  const toggleExpandedComments = useFeedStore((s) => s.toggleExpandedComments);
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);

  const handleLike = () => {
    toggleLike({
      authorType: reactionAuthor?.type,
      collegeId:
        reactionAuthor?.type === "college"
          ? parseInt(reactionAuthor.id)
          : undefined,
    });
  };

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

  const handleLikeCountClick = () => {
    if (!session?.user) {
      redirectToSigninWithReturn();
      return;
    }

    setIsLikesModalOpen(true);
  };

  const handleCommentCountClick = () => {
    if (onCommentClick) {
      onCommentClick(postId);
      return;
    }

    toggleExpandedComments(postId);
  };

  return (
    <div className={cn("", className)}>
      {/* Engagement count row */}
      {(safeLikeCount > 0 || safeCommentCount > 0) && (
        <div className="px-3 py-2 text-sm text-muted-foreground flex items-center justify-between">
          <span>
            {safeLikeCount > 0 ? (
              <button
                type="button"
                onClick={handleLikeCountClick}
                className="hover:underline underline-offset-2"
              >
                {safeLikeCount} {safeLikeCount === 1 ? "like" : "likes"}
              </button>
            ) : (
              ""
            )}
          </span>
          <span className="min-w-[84px] text-right">
            {safeCommentCount > 0 ? (
              <button
                type="button"
                onClick={handleCommentCountClick}
                className="hover:underline underline-offset-2"
              >
                {safeCommentCount}{" "}
                {safeCommentCount === 1 ? "comment" : "comments"}
              </button>
            ) : (
              ""
            )}
          </span>
        </div>
      )}

      {/* Action buttons - evenly spaced */}
      <div className="flex items-center border-t relative">
        {/* Reaction Author Selector */}
        <ReactionAuthorSelector className="ml-3 my-2" />

        {/* Like Button */}
        <Button
          variant="ghost"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "flex-1 rounded-none h-11 gap-2 font-medium px-2",
            hasLiked
              ? "text-primary hover:text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ThumbsUp className={cn("h-5 w-5", hasLiked && "fill-current")} />
          <span className="hidden sm:inline">Like</span>
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          onClick={() =>
            onCommentClick ? onCommentClick(postId) : toggleExpandedComments(postId)
          }
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

      <PostLikesModal
        postId={postId}
        open={isLikesModalOpen}
        onOpenChange={setIsLikesModalOpen}
      />
    </div>
  );
}
