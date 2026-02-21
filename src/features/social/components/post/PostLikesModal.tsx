"use client";

import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePostLikes } from "../../hooks/use-likes";
import { getAuthorProfilePath } from "../../utils/author-navigation";

interface PostLikesModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostLikesModal({
  postId,
  open,
  onOpenChange,
}: PostLikesModalProps) {
  const router = useRouter();
  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostLikes(postId, { enabled: open, limit: 20 });

  const likes = useMemo(
    () => data?.pages.flatMap((page) => page.items ?? []) ?? [],
    [data],
  );

  useEffect(() => {
    if (!open) return;
    if (!inView || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage, open]);

  const handleProfileNavigation = (like: (typeof likes)[number]) => {
    const targetPath = getAuthorProfilePath({
      authorId: like.actor.id,
      authorHandle: like.actorType === "user" ? like.actor.handle : null,
      type: like.actorType,
      collegeSlug: like.actor.slug,
      collegeId: like.actor.collegeId,
    });

    if (!targetPath) return;
    onOpenChange(false);
    router.push(targetPath);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[520px] p-0 gap-0 overflow-hidden grid-rows-[auto_minmax(0,1fr)]">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Likes</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="h-full flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="h-full px-6 py-8 text-center flex flex-col items-center justify-center">
              <p className="text-sm text-muted-foreground mb-3">
                {error instanceof Error
                  ? error.message
                  : "Failed to load likes"}
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : likes.length === 0 ? (
            <div className="h-full px-6 py-10 text-center text-sm text-muted-foreground flex items-center justify-center">
              No likes yet.
            </div>
          ) : (
            <div className="divide-y">
              {likes.map((like) => {
                const fallbackName =
                  like.actorType === "college" ? "College" : "User";
                const displayName = like.actor.name || fallbackName;

                return (
                  <button
                    type="button"
                    key={like.id}
                    onClick={() => handleProfileNavigation(like)}
                    className="w-full px-6 py-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={like.actor.image || ""}
                        alt={displayName}
                      />
                      <AvatarFallback>
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {displayName}
                      </p>
                    </div>
                  </button>
                );
              })}

              {(hasNextPage || isFetchingNextPage) && (
                <div ref={ref} className="py-3 flex justify-center">
                  {isFetchingNextPage ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
