"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useGroupFeed } from "../../hooks/use-group-detail";
import { GroupFeedPostCard } from "./GroupFeedPostCard";

interface GroupFeedProps {
  slugId: string;
  currentUserId?: string;
}

export function GroupFeed({ slugId, currentUserId }: GroupFeedProps) {
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
      {posts.map((post) => (
        <GroupFeedPostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}

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
