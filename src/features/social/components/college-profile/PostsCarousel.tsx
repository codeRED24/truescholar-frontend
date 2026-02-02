"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useCollegePosts } from "../../hooks/use-college-profile";
import {
  Post,
  Author,
  AuthorType,
  PostVisibility,
  GroupFeedPost,
} from "../../types";
import { formatRelativeTime } from "../../utils/formatters";

interface PostsCarouselProps {
  slugId: string;
}

export function PostsCarousel({ slugId }: PostsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data, isLoading, error } = useCollegePosts(slugId);

  // Flatten pages into posts array and map to standard Post type (limit to first 8)
  const posts: Post[] =
    data?.pages
      .flatMap((page) =>
        page.posts.map((p: GroupFeedPost) => ({
          id: p.id,
          content: p.content,
          author: {
            id: p.author.id,
            name: p.author.name,
            image: p.author.image ?? undefined,
            user_type: p.author.id.startsWith("college-") ? "college" : "user", // fallback
          } as Author,
          authorType: "user" as AuthorType, // Default to user since backend doesn't send type
          media: p.media,
          visibility: p.visibility as PostVisibility,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          hasLiked: p.isLiked,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          taggedCollege: undefined, // Removed college logic for now
        })),
      )
      .slice(0, 8) ?? [];

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10,
    );
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320; // Approximate card width + gap
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    // Update button states after scroll animation
    setTimeout(checkScrollButtons, 300);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Page posts</CardTitle>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full rounded-md mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Page posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Failed to load posts. Please try again.
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/feed/colleges/${slugId}/posts`}>Show all posts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Page posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-muted-foreground text-sm">
              This college hasn&apos;t posted anything yet.
            </p>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/feed/colleges/${slugId}/posts`}>Show all posts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Page posts</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Carousel container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 mb-4 -mx-1 px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {posts.map((post) => (
            <PostPreviewCard key={post.id} post={post} slugId={slugId} />
          ))}
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href={`/feed/colleges/${slugId}/posts`}>Show all posts</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// Individual post preview card
interface PostPreviewCardProps {
  post: Post;
  slugId: string;
}

function PostPreviewCard({ post, slugId }: PostPreviewCardProps) {
  const isCollegePost = post.authorType === "college" && !!post.taggedCollege;

  // Determine display author
  const displayAuthor = isCollegePost
    ? {
        id: post.taggedCollege!.slug
          ? `${post.taggedCollege!.slug}-${post.taggedCollege!.college_id}`
          : post.taggedCollege!.college_id.toString(),
        name: post.taggedCollege!.college_name,
        image: post.taggedCollege!.logo_img,
      }
    : post.author;

  const initials = displayAuthor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Truncate content
  const maxContentLength = 120;
  const truncatedContent =
    post.content.length > maxContentLength
      ? post.content.slice(0, maxContentLength) + "..."
      : post.content;

  // Get first media item for thumbnail
  const firstMedia = post.media[0];

  return (
    <Link
      href={`/feed/colleges/${slugId}/posts`}
      className="flex-shrink-0 w-[280px] md:w-[300px] block"
    >
      <div className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors h-full flex flex-col">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={displayAuthor.image ?? undefined}
              alt={displayAuthor.name}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {displayAuthor.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Media thumbnail */}
        {firstMedia ? (
          <div className="relative aspect-video rounded-md overflow-hidden bg-muted mb-3 flex-shrink-0">
            {firstMedia.type === "image" ? (
              <img
                src={firstMedia.url}
                alt={firstMedia.altText || "Post image"}
                className="w-full h-full object-cover"
              />
            ) : firstMedia.type === "video" ? (
              <>
                {firstMedia.thumbnailUrl ? (
                  <img
                    src={firstMedia.thumbnailUrl}
                    alt={firstMedia.altText || "Video thumbnail"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">Document</span>
              </div>
            )}
            {post.media.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                +{post.media.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video rounded-md bg-muted mb-3 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Content snippet */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncatedContent}
          </p>
          {post.content.length > maxContentLength && (
            <span className="text-primary text-sm font-medium">...more</span>
          )}
        </div>
      </div>
    </Link>
  );
}
