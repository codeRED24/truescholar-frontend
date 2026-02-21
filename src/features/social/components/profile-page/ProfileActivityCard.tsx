"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostComposer } from "@/features/social/components/post/PostComposer";
import { PostCard } from "@/features/social/components/post/PostCard";
import type { Author } from "@/features/social/types";
import {
  useUserCommentsActivity,
  useUserPostsActivity,
} from "@/features/social/hooks/use-profile-activity";

type ActivityTab = "posts" | "comments";
const PREVIEW_POST_LIMIT = 4;

interface ProfileActivityCardProps {
  activityUserId: string;
  profileHandle: string;
  isOwner?: boolean;
  currentUser?: Author;
}

function clipText(value: string, max = 120): string {
  const trimmed = value.trim();
  if (!trimmed) return "No content";
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}...`;
}

function formatRelativeTime(value?: string | null): string {
  if (!value) return "recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "recently";

  const diffMs = Date.now() - parsed.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`activity-skeleton-${index}`}
          className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-1 h-3 w-4/5 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ProfileActivityCard({
  activityUserId,
  profileHandle,
  isOwner = false,
  currentUser,
}: ProfileActivityCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActivityTab>("posts");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postStartIndex, setPostStartIndex] = useState(0);
  const postsActivity = useUserPostsActivity(activityUserId, {
    enabled: activeTab === "posts",
    limit: PREVIEW_POST_LIMIT,
  });
  const commentsActivity = useUserCommentsActivity(activityUserId, {
    enabled: activeTab === "comments",
    limit: 5,
  });

  const activeActivity = useMemo(
    () => (activeTab === "posts" ? postsActivity : commentsActivity),
    [activeTab, postsActivity, commentsActivity],
  );

  const handleRetry = async () => {
    await activeActivity.refetch();
  };

  const handleSeeMore = () => {
    const destination =
      activeTab === "posts"
        ? `/feed/profile/${profileHandle}/recent-activity/all`
        : `/feed/profile/${profileHandle}/recent-activity/comments`;
    router.push(destination);
  };

  const previewPosts = useMemo(
    () => postsActivity.items.slice(0, PREVIEW_POST_LIMIT),
    [postsActivity.items],
  );
  const maxPostStartIndex = Math.max(0, previewPosts.length - 2);
  const visiblePosts = previewPosts.slice(postStartIndex, postStartIndex + 2);

  useEffect(() => {
    setPostStartIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (previewPosts.length === 0) {
      setPostStartIndex(0);
      return;
    }

    if (postStartIndex > maxPostStartIndex) {
      setPostStartIndex(maxPostStartIndex);
    }
  }, [maxPostStartIndex, postStartIndex, previewPosts.length]);

  const hasTeaserPost = Boolean(previewPosts[PREVIEW_POST_LIMIT - 1]);
  const isTeaserVisible =
    activeTab === "posts" &&
    hasTeaserPost &&
    postStartIndex === maxPostStartIndex;

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Activity</CardTitle>
        {isOwner && currentUser ? (
          <Button
            type="button"
            size="sm"
            className="rounded-full"
            onClick={() => setIsComposerOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Create post
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-full px-5"
            variant={activeTab === "posts" ? "default" : "outline"}
            onClick={() => setActiveTab("posts")}
          >
            Post
          </Button>
          <Button
            size="sm"
            className="rounded-full px-5"
            variant={activeTab === "comments" ? "default" : "outline"}
            onClick={() => setActiveTab("comments")}
          >
            Comments
          </Button>
        </div>

        {activeActivity.isLoading ? <ActivitySkeleton /> : null}

        {activeActivity.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">
              Unable to load activity right now.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-full"
              onClick={handleRetry}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!activeActivity.isLoading && !activeActivity.isError ? (
          <>
            {activeTab === "posts" ? (
              previewPosts.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative">
                    {postStartIndex > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
                        onClick={() =>
                          setPostStartIndex((prev) => Math.max(0, prev - 1))
                        }
                        aria-label="Previous posts"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    ) : null}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {visiblePosts.map((post, index) => {
                        const absoluteIndex = postStartIndex + index;
                        const isTeaserCard = absoluteIndex === PREVIEW_POST_LIMIT - 1;

                        if (isTeaserCard) {
                          return (
                            <div
                              key={post.id}
                              data-testid="posts-teaser-card"
                              className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                            >
                              <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 bg-muted/20 p-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                  See more recent activity
                                </p>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={handleSeeMore}
                                >
                                  See more
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={post.id}
                            className="h-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                          >
                            <PostCard
                              post={post}
                              variant="compact"
                              truncateLength={120}
                              contentLineClamp={2}
                              alignActionsToBottom
                              className="h-full"
                              currentUserId={currentUser?.id}
                              onCommentClick={(postId) =>
                                router.push(`/feed/post/${postId}`)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>

                    {postStartIndex < maxPostStartIndex ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 z-10 h-8 w-8 translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
                        onClick={() =>
                          setPostStartIndex((prev) =>
                            Math.min(maxPostStartIndex, prev + 1),
                          )
                        }
                        aria-label="Next posts"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              )
            ) : commentsActivity.items.length > 0 ? (
              <div className="space-y-3">
                {commentsActivity.items.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
                  >
                    <p className="text-[11px] text-muted-foreground">
                      {(comment.author.name || "User").toLowerCase()} commented{" "}
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                    <p className="mt-1 text-sm">
                      {clipText(comment.content, 170)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </>
        ) : null}

        {!isTeaserVisible ? (
          <Button
            variant="ghost"
            className="w-full rounded-lg text-muted-foreground"
            onClick={handleSeeMore}
          >
            See more
          </Button>
        ) : null}
      </CardContent>
      {isOwner && currentUser ? (
        <PostComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          currentUser={currentUser}
        />
      ) : null}
    </Card>
  );
}
