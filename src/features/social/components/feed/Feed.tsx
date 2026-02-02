// Virtualized Feed Container Component
// Uses TanStack Virtual with WINDOW scrolling (like LinkedIn)

"use client";

import { useRef, useCallback, useEffect } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useFlattenedFeed, useGuestFeed } from "../../hooks/use-feed";
import { PostCard } from "../post/PostCard";
import { PostSkeletonList } from "../post/PostSkeleton";
import { FeedEmpty } from "./FeedEmpty";
import { WhoToFollowCard } from "./WhoToFollowCard";
import { cn } from "@/lib/utils";
import type { Post, FeedItem } from "../../types";

interface FeedProps {
  isAuthenticated?: boolean;
  currentUserId?: string;
  onAuthorClick?: (authorId: string, type?: "user" | "college") => void;
  onPostEdit?: (post: Post) => void;
  onPostDelete?: (postId: string) => void;
  className?: string;
}

// Estimated heights for different item types
const ESTIMATED_POST_HEIGHT = 400;
const ESTIMATED_SUGGESTION_HEIGHT = 280;
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

  const guestItems = guestFeedQuery.data?.pages.flatMap((p) => p.items) ?? [];

  const {
    items,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isEmpty,
    error,
  } = isAuthenticated
    ? authenticatedFeed
    : {
        items: guestItems,
        isLoading: guestFeedQuery.isLoading,
        isFetching: guestFeedQuery.isFetching,
        hasNextPage: guestFeedQuery.hasNextPage,
        fetchNextPage: guestFeedQuery.fetchNextPage,
        isFetchingNextPage: guestFeedQuery.isFetchingNextPage,
        isEmpty: guestFeedQuery.isSuccess && guestItems.length === 0,
        error: guestFeedQuery.error,
      };

  // Total count includes items + 1 loader row if more pages exist
  const totalCount = items.length + (hasNextPage ? 1 : 0);

  // Use WINDOW virtualizer - scrolls with the page, not a container
  const virtualizer = useWindowVirtualizer({
    count: totalCount,
    estimateSize: (index) => {
      if (index === items.length) {
        // Larger height for skeleton list to prevent scroll jumping
        return isFetchingNextPage ? ESTIMATED_POST_HEIGHT * 3 : LOADER_HEIGHT;
      }
      const item = items[index];
      if (item?.type === "suggestions") return ESTIMATED_SUGGESTION_HEIGHT;
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
      lastItem.index >= items.length - 3 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    items.length,
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
          const isLoaderRow = virtualItem.index === items.length;

          // Loader row
          if (isLoaderRow) {
            return (
              <div
                key="loader"
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
                className={cn(
                  "flex items-center justify-center",
                  !isFetchingNextPage && "py-6",
                )}
              >
                {isFetchingNextPage ? (
                  <div className="w-full">
                    <PostSkeletonList count={3} />
                  </div>
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

          const feedItem = items[virtualItem.index] as FeedItem;

          if (!feedItem) return null;

          // Suggestions card (from backend)
          if (feedItem.type === "suggestions") {
            return (
              <div
                key={`suggestions-${virtualItem.index}`}
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
                <div className="mb-4">
                  <WhoToFollowCard suggestions={feedItem.suggestions} />
                </div>
              </div>
            );
          }

          // Post card
          const post = feedItem.post;

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
    </div>
  );
}
