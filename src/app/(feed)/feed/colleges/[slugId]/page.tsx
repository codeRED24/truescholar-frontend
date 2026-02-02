"use client";

import { use } from "react";
import { OverviewSection, PostsCarousel, EventsSection, PeoplesSection } from "@/features/social/components/college-profile";
import { useCollegeProfile } from "@/features/social/hooks/use-college-profile";
import { Loader2 } from "lucide-react";

export default function CollegeHomePage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const { data: profile, isLoading } = useCollegeProfile(slugId);

  if (isLoading || !profile) {
    return <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />;
  }

  return (
    <>
      <OverviewSection profile={profile} slugId={slugId} />
      <PostsCarousel slugId={slugId} />
      <EventsSection />
      <PeoplesSection />
    </>
  );
}
