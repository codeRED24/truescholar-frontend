"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useGroupDetail, useJoinGroup, useLeaveGroup, useRequestToJoin, useCancelJoinRequest } from "@/features/social/hooks/use-group-detail";
import { useDeletePost } from "@/features/social/hooks/use-post";
import { GroupHeader } from "@/features/social/components/groups/GroupHeader";
import { GroupAbout } from "@/features/social/components/groups/GroupAbout";
import { GroupFeed } from "@/features/social/components/groups/GroupFeed";
import { PostComposer } from "@/features/social/components/post/PostComposer";
import { GroupMembersList } from "@/features/social/components/groups/GroupMembersList";
import { Post } from "@/features/social/types";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupProfilePage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugIdParam = params.slugId;
  
  // Extract UUID if present (format: slug-uuid)
  // UUID pattern: 8-4-4-4-12 hex digits (36 chars)
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = slugIdParam.match(uuidPattern);
  const derivedId = match ? match[0] : slugIdParam;

  const router = useRouter();
  const { data: session } = useSession();
  
  // Fetch using the derived ID (or slug if no UUID found)
  // Backend getGroupBySlug supports both now
  const { data: group, isLoading, error } = useGroupDetail(derivedId);

  // URL Normalization / Redirect
  if (group && !isLoading) {
    const canonicalUrl = `${group.slug}-${group.id}`;
    if (slugIdParam !== canonicalUrl) {
      // Use replace to avoid history stack pollution
      router.replace(`/feed/groups/${canonicalUrl}`);
    }
  }

  // Use the real group ID for mutations once loaded, fallback to derivedId
  const targetId = group?.id || derivedId;

  // Mutations
  const joinGroup = useJoinGroup(targetId);
  const leaveGroup = useLeaveGroup(targetId);
  const requestJoin = useRequestToJoin(targetId);
  const cancelRequest = useCancelJoinRequest(targetId);
  const deletePost = useDeletePost();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const handlePostEdit = (post: Post) => {
    setEditingPost(post);
    setIsComposerOpen(true);
  };

  const handlePostDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete post");
    }
  };

  const handleComposerClose = () => {
    setIsComposerOpen(false);
    setEditingPost(null);
  };

  const handleJoin = async () => {
    try {
      await joinGroup.mutateAsync();
      toast.success("Joined group successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveGroup.mutateAsync();
      toast.success("Left group successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to leave");
    }
  };

  const handleRequestJoin = async () => {
    try {
      await requestJoin.mutateAsync(undefined);
      toast.success("Request sent!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send request");
    }
  };

  const handleCancelRequest = async () => {
    try {
      await cancelRequest.mutateAsync();
      toast.success("Request cancelled");
    } catch (error) {
      toast.error("Failed to cancel request");
    }
  };

  const handleSettings = () => {
    if (group) {
      router.push(`/feed/groups/${group.slug}-${group.id}/settings`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-2">Group not found</h1>
        <p className="text-muted-foreground mb-4">
          The group you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/feed/groups")}
          className="text-primary hover:underline"
        >
          Browse groups
        </button>
      </div>
    );
  }

  const isMember = group.isMember;
  const canPost = isMember;
  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    image: session.user.image || undefined
  } : undefined;

  // Determine if feed should be shown
  const canViewFeed = isMember || group.type === "public" || (group.type === "private" && group.privacy === "visible" && false); // Only public or member for now
  
  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <GroupHeader 
        group={group}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onRequestJoin={handleRequestJoin}
        onCancelRequest={handleCancelRequest}
        onSettings={handleSettings}
        isJoining={joinGroup.isPending}
        isLeaving={leaveGroup.isPending}
        isRequesting={requestJoin.isPending || cancelRequest.isPending}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 sm:px-0">
        {/* Main Content (Feed) */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="feed" className="w-full">
             <TabsList>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="about" className="lg:hidden">About</TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6 mt-6">
              {canPost && currentUser && (
                <>
                  <Card 
                    onClick={() => setIsComposerOpen(true)} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors shadow-sm"
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.image} />
                        <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 rounded-full px-4 py-2.5 text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                        Write something...
                      </div>
                    </CardContent>
                  </Card>

                  <PostComposer
                    isOpen={isComposerOpen}
                    onClose={handleComposerClose}
                    currentUser={currentUser}
                    groupId={targetId}
                    postToEdit={editingPost}
                  />
                </>
              )}

              {canViewFeed ? (
                <GroupFeed 
                  slugId={targetId} 
                  currentUserId={currentUser?.id}
                  onEdit={handlePostEdit}
                  onDelete={handlePostDelete}
                />
              ) : (
                <div className="text-center py-12 border rounded-xl bg-muted/20">
                  <h3 className="text-lg font-medium">This group is private</h3>
                  <p className="text-muted-foreground mt-2">
                    Join this group to view and participate in discussions.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <GroupMembersList slugId={targetId} currentUserRole={group.userRole} />
            </TabsContent>

            <TabsContent value="about" className="mt-6 lg:hidden">
              <GroupAbout group={group} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar (About) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <GroupAbout group={group} />
        </div>
      </div>
    </div>
  );
}
