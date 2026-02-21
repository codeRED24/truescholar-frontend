"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/features/social/components/post/PostCard";
import { PostComposer } from "@/features/social/components/post/PostComposer";
import {
  useUserCommentsActivity,
  useUserPostsActivity,
} from "@/features/social/hooks/use-profile-activity";
import type { Author } from "@/features/social/types";
import { getAuthorProfilePath } from "@/features/social/utils/author-navigation";

export type RecentActivityTab = "posts" | "comments";

interface ProfileRecentActivityCenterProps {
  activityUserId: string;
  profileHandle: string;
  activeTab: RecentActivityTab;
  isOwner: boolean;
  currentUser?: Author;
  currentUserId?: string;
}

function clipText(value: string, maxLength = 180): string {
  const normalized = value.trim();
  if (!normalized) return "No content";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
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
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`recent-activity-skeleton-${index}`}
          className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-950"
        >
          <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-24 animate-pulse rounded-lg bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ProfileRecentActivityCenter({
  activityUserId,
  profileHandle,
  activeTab,
  isOwner,
  currentUser,
  currentUserId,
}: ProfileRecentActivityCenterProps) {
  const router = useRouter();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const postsActivity = useUserPostsActivity(activityUserId, {
    enabled: activeTab === "posts",
    limit: 10,
  });
  const commentsActivity = useUserCommentsActivity(activityUserId, {
    enabled: activeTab === "comments",
    limit: 10,
  });
  const activeActivity = useMemo(
    () => (activeTab === "posts" ? postsActivity : commentsActivity),
    [activeTab, postsActivity, commentsActivity],
  );
  const {
    hasNextPage,
    isFetchingNextPage,
    isLoading: isActivityLoading,
    isError: isActivityError,
    fetchNextPage,
  } = activeActivity;

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "240px 0px",
  });

  useEffect(() => {
    if (!inView) return;
    if (!hasNextPage) return;
    if (isFetchingNextPage) return;
    if (isActivityLoading || isActivityError) return;
    void fetchNextPage();
  }, [
    inView,
    hasNextPage,
    isFetchingNextPage,
    isActivityLoading,
    isActivityError,
    fetchNextPage,
  ]);

  const handleLoadMore = async () => {
    if (!activeActivity.hasNextPage || activeActivity.isFetchingNextPage) return;
    await activeActivity.fetchNextPage();
  };

  const handleRetry = async () => {
    await activeActivity.refetch();
  };

  const postsTabHref = `/feed/profile/${profileHandle}/recent-activity/all`;
  const commentsTabHref = `/feed/profile/${profileHandle}/recent-activity/comments`;

  return (
    <Card className="border-neutral-200 bg-neutral-100/80 shadow-sm dark:bg-neutral-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">All activity</CardTitle>
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
            asChild
            size="sm"
            className="rounded-full px-5"
            variant={activeTab === "posts" ? "default" : "outline"}
          >
            <Link href={postsTabHref}>Posts</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full px-5"
            variant={activeTab === "comments" ? "default" : "outline"}
          >
            <Link href={commentsTabHref}>Comments</Link>
          </Button>
        </div>

        {activeActivity.isLoading ? <ActivitySkeleton /> : null}

        {activeActivity.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Unable to load activity right now.</p>
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
              postsActivity.items.length > 0 ? (
                <div className="space-y-4">
                  {postsActivity.items.map((post) => (
                    <div
                      key={post.id}
                      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10"
                    >
                      <PostCard
                        post={post}
                        currentUserId={currentUserId}
                        onAuthorClick={(
                          authorId,
                          type = "user",
                          authorHandle,
                        ) => {
                          const path = getAuthorProfilePath({
                            authorId,
                            authorHandle,
                            type,
                          });
                          if (!path) return;
                          router.push(path);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              )
            ) : commentsActivity.items.length > 0 ? (
              <div className="space-y-3">
                {commentsActivity.items.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-950 dark:ring-white/10"
                  >
                    <p className="text-xs text-muted-foreground">
                      {comment.author.name || "User"} commented{" "}
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {clipText(comment.content, 300)}
                    </p>
                    {comment.post?.content ? (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        On post: {clipText(comment.post.content, 140)}
                      </p>
                    ) : null}
                    <Link
                      href={`/feed/post/${comment.postId}`}
                      className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
                    >
                      View post
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}

            {activeActivity.items.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div ref={loadMoreRef} className="h-1 w-full" />
                {activeActivity.hasNextPage ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-lg"
                    onClick={handleLoadMore}
                    disabled={activeActivity.isFetchingNextPage}
                  >
                    {activeActivity.isFetchingNextPage ? "Loading..." : "Load more"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
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
