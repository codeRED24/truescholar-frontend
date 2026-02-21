"use client";

import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSidebar } from "@/features/social/components/profile-page/ProfileSidebar";
import { ProfileRecentActivityCenter, type RecentActivityTab } from "@/features/social/components/profile-page/ProfileRecentActivityCenter";
import { SidebarProfile } from "@/features/social/components/sidebar/SidebarProfile";
import { usePublicProfilePage } from "@/features/social/hooks/use-public-profile-page";
import { useUserFollowStats } from "@/features/social/hooks/use-profile-activity";
import { useSession } from "@/lib/auth-client";

interface ProfileRecentActivityPageProps {
  profileHandle: string;
  initialTab: RecentActivityTab;
}

function RecentActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4 lg:col-span-6">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProfileRecentActivityPage({
  profileHandle,
  initialTab,
}: ProfileRecentActivityPageProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const sessionAuthor = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "You",
        image: session.user.image ?? undefined,
      }
    : undefined;

  const {
    profile,
    profileUser,
    isOwner,
    isLoading,
    error,
    refreshProfile,
  } = usePublicProfilePage(profileHandle || "", session?.user?.id);

  const { data: followStats } = useUserFollowStats(profileUser?.id || "", {
    enabled: Boolean(profileUser?.id),
  });

  useEffect(() => {
    if (!profileUser?.handle) return;
    if (profileUser.handle === profileHandle) return;
    const section = initialTab === "comments" ? "comments" : "all";
    router.replace(`/feed/profile/${profileUser.handle}/recent-activity/${section}`);
  }, [initialTab, profileHandle, profileUser?.handle, router]);

  if (!profileHandle) {
    return (
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="space-y-3 p-6 text-center">
          <h1 className="text-xl font-semibold">Invalid profile URL</h1>
          <p className="text-sm text-muted-foreground">
            This profile link is not valid.
          </p>
          <div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isSessionPending) {
    return <RecentActivitySkeleton />;
  }

  if (error || !profileUser) {
    return (
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="space-y-3 p-6 text-center">
          <h1 className="text-xl font-semibold">User not found</h1>
          <p className="text-sm text-muted-foreground">
            {error || "This profile does not exist or has been removed."}
          </p>
          <div>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profileSummary = profile?.bio?.trim();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-3">
        <div className="lg:sticky lg:top-20">
          <SidebarProfile
            user={{
              name: profileUser.name || "User",
              handle: profileUser.handle || profileHandle,
              image: profileUser.image ?? undefined,
              headline:
                profileSummary && profileSummary.length > 0
                  ? profileSummary
                  : "TrueScholar member",
            }}
            stats={{
              posts: 0,
              followers: followStats?.followersCount ?? 0,
              following: followStats?.followingCount ?? 0,
            }}
          />
        </div>
      </div>

      <div className="space-y-4 lg:col-span-6">
        <ProfileRecentActivityCenter
          activityUserId={profileUser.id}
          profileHandle={profileUser.handle || profileHandle}
          activeTab={initialTab}
          isOwner={isOwner}
          currentUser={sessionAuthor}
          currentUserId={session?.user?.id}
        />
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="lg:sticky lg:top-20">
          <ProfileSidebar
            profileHandle={profileUser.handle || profileHandle}
            isOwner={isOwner}
            onHandleUpdated={refreshProfile}
          />
        </div>
      </div>
    </div>
  );
}
