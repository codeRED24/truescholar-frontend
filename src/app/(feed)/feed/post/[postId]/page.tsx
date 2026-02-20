"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PostCard } from "@/features/social/components/post/PostCard";
import { PostSkeleton } from "@/features/social/components/post/PostSkeleton";
import { usePost } from "@/features/social/hooks/use-post";
import { useSession } from "@/lib/auth-client";

function PostDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = params.postId as string;
  const groupId = searchParams.get("groupId");

  const { data: session } = useSession();
  const { data: post, isLoading, isError, error } = usePost(postId);

  const backHref = groupId ? `/feed/groups/${groupId}` : "/feed";

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <PostSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold">Post unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "This post is unavailable or you do not have access."}
          </p>
          <Button className="mt-5" onClick={() => router.push(backHref)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.push(backHref)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <PostCard
          post={post}
          variant="detail"
          currentUserId={session?.user?.id}
          groupId={groupId ?? undefined}
        />
      </Card>
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <PostSkeleton />
        </div>
      }
    >
      <PostDetailPageContent />
    </Suspense>
  );
}
