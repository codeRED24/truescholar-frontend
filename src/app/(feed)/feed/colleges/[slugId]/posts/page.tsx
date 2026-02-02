"use client";

import { use } from "react";
import { CollegeFeed } from "@/features/social/components/college-profile/CollegeFeed";
import { useSession } from "@/lib/auth-client";

export default function CollegePostsPage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const { data: session } = useSession();

  return (
    <CollegeFeed 
      slugId={slugId} 
      currentUserId={session?.user?.id}
    />
  );
}
