// Virtualized Feed Container Component
// Uses TanStack Virtual with WINDOW scrolling (like LinkedIn)

"use client";

import { useRef, useCallback, useEffect } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useFlattenedFeed, useGuestFeed } from "../../hooks/use-feed";
import { PostCard } from "../post/PostCard";
import { PostSkeletonList } from "../post/PostSkeleton";
import { FeedEmpty } from "./FeedEmpty";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "../../types";

interface FeedProps {
  isAuthenticated?: boolean;
  currentUserId?: string;
  onAuthorClick?: (authorId: string) => void;
  onPostEdit?: (post: Post) => void;
  onPostDelete?: (postId: string) => void;
  className?: string;
}

// Estimated heights for different post types
const ESTIMATED_POST_HEIGHT = 400;
const LOADER_HEIGHT = 80;

export function Feed({
  isAuthenticated = false,
  currentUserId,
  onAuthorClick,
  onPostEdit,
  onPostDelete,
  className,
}: FeedProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Use authenticated feed or guest feed based on auth state
  const authenticatedFeed = useFlattenedFeed({ enabled: isAuthenticated });
  const guestFeedQuery = useGuestFeed({ enabled: !isAuthenticated });

  const guestPosts = guestFeedQuery.data?.pages.flatMap((p) => p.posts) ?? [];

  const {
    posts,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isEmpty,
    error,
  } = isAuthenticated
    ? authenticatedFeed
    : {
        posts: guestPosts,
        isLoading: guestFeedQuery.isLoading,
        hasNextPage: guestFeedQuery.hasNextPage,
        fetchNextPage: guestFeedQuery.fetchNextPage,
        isFetchingNextPage: guestFeedQuery.isFetchingNextPage,
        isEmpty: guestFeedQuery.isSuccess && guestPosts.length === 0,
        error: guestFeedQuery.error,
      };

  // Total count includes posts + 1 loader row if more pages exist
  const totalCount = posts.length + (hasNextPage ? 1 : 0);

  // Use WINDOW virtualizer - scrolls with the page, not a container
  const virtualizer = useWindowVirtualizer({
    count: totalCount,
    estimateSize: (index) => {
      if (index === posts.length) return LOADER_HEIGHT;
      return ESTIMATED_POST_HEIGHT;
    },
    overscan: 2,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Fetch more when scrolling near the end
  const handleScroll = useCallback(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= posts.length - 3 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    posts.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Listen to window scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return <PostSkeletonList count={3} />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load feed</p>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message || "Please try again later"}
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return <FeedEmpty isAuthenticated={isAuthenticated} />;
  }

  return (
    <div ref={listRef} className={cn("w-full", className)}>
      {/* Container with total height for proper scrollbar */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {/* Only render visible items */}
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index === posts.length;

          if (isLoaderRow) {
            return (
              <div
                key="loader"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${
                    virtualItem.start - virtualizer.options.scrollMargin
                  }px)`,
                }}
                className="flex items-center justify-center py-6"
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : hasNextPage ? (
                  <span className="text-sm text-muted-foreground">
                    Scroll for more
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    You&apos;re all caught up! 🎉
                  </span>
                )}
              </div>
            );
          }

          const post = posts[virtualItem.index];

          return (
            <div
              key={post.id}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${
                  virtualItem.start - virtualizer.options.scrollMargin
                }px)`,
              }}
            >
              <div className="bg-card rounded-xl border shadow-sm mb-4">
                <PostCard
                  post={post}
                  currentUserId={currentUserId}
                  onAuthorClick={onAuthorClick}
                  onEdit={onPostEdit}
                  onDelete={onPostDelete}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Debug info - remove in production
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded z-50">
          Rendering {virtualItems.length} of {posts.length} posts
        </div>
      )} */}
    </div>
  );
}
