"use client";

import { useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { useCollegePosts } from "../../hooks/use-college-profile";
import { PostCard } from "../post/PostCard";
import { Post, Author } from "../../types";

interface CollegeFeedProps {
  slugId: string;
  currentUserId?: string;
}

export function CollegeFeed({
  slugId,
  currentUserId,
}: CollegeFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useCollegePosts(slugId);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // Flatten pages into posts array and map to standard Post type
  const posts: Post[] = data?.pages.flatMap((page) => 
    page.posts.map((p: any) => ({
      id: p.id,
      content: p.content,
      author: {
        id: p.author.id,
        name: p.author.name,
        image: p.author.image ?? undefined,
        user_type: p.authorType,
      } as Author,
      authorType: p.authorType as any,
      media: p.media,
      visibility: p.visibility as any,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      hasLiked: p.hasLiked,
      isFollowing: p.isFollowing, // Add isFollowing mapping
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      taggedCollege: p.authorType === "college" ? {
        college_id: parseInt(p.author.id.split("-").pop() || "0"),
        college_name: p.author.name,
        logo_img: p.author.image ?? undefined,
        slug: p.author.id.split("-").slice(0, -1).join("-"),
      } : undefined
    }))
  ) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load posts. Please try again.
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium mb-1">No posts yet</p>
          <p className="text-muted-foreground text-sm">
            This college hasn&apos;t posted anything yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          className="bg-card border rounded-xl"
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
