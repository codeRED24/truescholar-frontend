"use client";

import { useState } from "react";
import {
  Feed,
  InlineComposer,
  PostComposer,
  SidebarProfile,
  SidebarNavigation,
  RightSidebar,
  MessagingWidget,
  MobileProfileCard,
} from "@/features/social";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import StatsCard from "@/features/social/components/sidebar/StatsCard";

export default function FeedPage() {
  // Inside FeedPage component
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null); // Using any temporarily for Post type safely

  const isAuthenticated = !!session?.user;
  const currentUserId = session?.user?.id;

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "User",
        image: session.user.image ?? undefined,
        // Mock data for new profile fields
        handle: "username",
        banner: undefined,
        headline: "Student at TrueScholar University",
      }
    : undefined;

  // Mock stats
  const mockStats = {
    posts: 42,
    followers: 856,
    following: 124,
  };

  const handleAuthorClick = (
    authorId: string,
    type: "user" | "college" = "user",
  ) => {
    if (type === "college") {
      router.push(`/feed/groups/${authorId}`);
    } else {
      router.push(`/feed/profile/${authorId}`);
    }
  };

  const handlePostEdit = (post: any) => {
    setEditingPost(post);
    setIsPostComposerOpen(true);
  };

  const handleComposerClose = () => {
    setIsPostComposerOpen(false);
    setTimeout(() => setEditingPost(null), 300); // Wait for animation
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            {isAuthenticated && currentUser && (
              <SidebarProfile user={currentUser} stats={mockStats} />
            )}

            <StatsCard stats={mockStats} />
            <SidebarNavigation />
          </div>
        </div>

        {/* Center: Composer + Feed */}
        <div className="col-span-1 md:col-span-9 lg:col-span-6">
          {/* Header (visible on mobile/tablet mainly) */}
          {currentUser ? (
            <MobileProfileCard user={currentUser} />
          ) : (
            <div className="mb-6 md:hidden">
              <h1 className="text-2xl font-bold">Feed</h1>
              <p className="text-muted-foreground text-sm">
                Discover trending content
              </p>
            </div>
          )}

          {/* Inline Composer */}
          {isAuthenticated && (
            <InlineComposer
              currentUser={currentUser}
              onPostClick={() => setIsPostComposerOpen(true)}
            />
          )}

          {/* Feed */}
          <Feed
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
            onAuthorClick={handleAuthorClick}
            onPostEdit={handlePostEdit}
          />
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Post Composer Modal (Create & Edit) */}
      <PostComposer
        isOpen={isPostComposerOpen}
        onClose={handleComposerClose}
        currentUser={currentUser}
        postToEdit={editingPost}
      />

      {/* Messaging Widget */}
      {isAuthenticated && <MessagingWidget />}
    </div>
  );
}
