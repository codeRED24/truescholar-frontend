"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useGroupFeed } from "../../hooks/use-group-detail";
import { PostCard } from "../post/PostCard";
import { transformGroupPostToPost } from "../../utils/post-transforms";
import { Post } from "../../types";

interface GroupFeedProps {
  slugId: string;
  currentUserId?: string;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export function GroupFeed({ slugId, currentUserId, onEdit, onDelete }: GroupFeedProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useGroupFeed(slugId);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load posts. Please try again.
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const transformedPost = transformGroupPostToPost(post);
        return (
          <PostCard
            key={post.id}
            post={transformedPost}
            currentUserId={currentUserId}
            groupId={slugId}
            onEdit={onEdit ? () => onEdit(transformedPost) : undefined}
            onDelete={onDelete}
          />
        );
      })}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
