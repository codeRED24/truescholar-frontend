"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import {
  ProfileAboutCard,
  ProfileActivityCard,
  ProfileAnalyticsCard,
  ProfileEducationCard,
  ProfileExperienceCard,
  ProfileHeroCard,
  ProfileHeroCardSkeleton,
  ProfileSidebar,
} from "@/features/social/components/profile-page";
import { usePublicProfilePage } from "@/features/social/hooks/use-public-profile-page";
import { useUserFollowStats } from "@/features/social/hooks/use-profile-activity";

function ProfileContentSkeleton() {
  return (
    <div className="space-y-4">
      <ProfileHeroCardSkeleton />
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const sessionAuthor = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "You",
        image: session.user.image ?? undefined,
      }
    : undefined;

  const paramIdentifier = params?.userId;
  const handle = Array.isArray(paramIdentifier)
    ? paramIdentifier[0]
    : paramIdentifier;

  const {
    profile,
    profileUser,
    isOwner,
    isFollowing,
    isFollowLoading,
    isLoading,
    error,
    toggleFollow,
    refreshProfile,
  } = usePublicProfilePage(handle || "", session?.user?.id);
  const { data: followStats } = useUserFollowStats(profileUser?.id || "", {
    enabled: Boolean(profileUser?.id),
  });

  useEffect(() => {
    if (!profileUser?.handle) return;
    if (!handle || profileUser.handle === handle) return;
    router.replace(`/feed/profile/${profileUser.handle}`);
  }, [handle, profileUser?.handle, router]);

  if (!handle) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] dark:bg-black">
        <div className="container mx-auto max-w-7xl px-4 py-6">
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
        </div>
      </div>
    );
  }

  if (isLoading || isSessionPending) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] dark:bg-black">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <ProfileContentSkeleton />
            </div>
            <div className="space-y-4 lg:col-span-4">
              <Card className="border-neutral-200 shadow-sm">
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] dark:bg-black">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="space-y-3 p-6 text-center">
              <h1 className="text-xl font-semibold">User not found</h1>
              <p className="text-sm text-muted-foreground">
                {error || "This profile doesn't exist or has been removed."}
              </p>
              <div>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <ProfileHeroCard
              profile={profile}
              profileUser={profileUser}
              followersCount={followStats?.followersCount}
              followingCount={followStats?.followingCount}
              isOwner={isOwner}
              isAuthenticated={Boolean(session?.user)}
              isFollowing={isFollowing}
              isFollowLoading={isFollowLoading}
              onToggleFollow={toggleFollow}
            />
            <ProfileAnalyticsCard />
            <ProfileAboutCard bio={profile?.bio} />
            <ProfileActivityCard
              activityUserId={profileUser.id}
              profileHandle={profileUser.handle || handle}
              isOwner={isOwner}
              currentUser={sessionAuthor}
            />
            <ProfileExperienceCard experience={profile?.experience} />
            <ProfileEducationCard education={profile?.education} />
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-20">
              <ProfileSidebar
                profileHandle={profileUser.handle || handle}
                isOwner={isOwner}
                onHandleUpdated={refreshProfile}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
