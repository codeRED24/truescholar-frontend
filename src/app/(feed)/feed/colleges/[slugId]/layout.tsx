"use client";

import { use, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CollegeHeader, CollegeTabs, CollegeSidebar } from "@/features/social/components/college-profile";
import { useCollegeProfile } from "@/features/social/hooks/use-college-profile";
import { useRouter } from "next/navigation";

export default function CollegeProfileLayout(props: {
  children: React.ReactNode;
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const router = useRouter();
  const { data: profile, isLoading, error } = useCollegeProfile(slugId);

  // If error, redirect to 404 or handle gracefully
  useEffect(() => {
    if (error) {
      // toast.error("College not found");
      // router.push("/feed"); 
    }
  }, [error, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-2">College not found</h1>
        <p className="text-muted-foreground mb-4">
          The college you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/feed")}
          className="text-primary hover:underline"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4">
      <CollegeHeader profile={profile} slugId={slugId} />
      <CollegeTabs slugId={slugId} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-1 lg:col-span-8">{props.children}</div>

        {/* Right Sidebar */}
        <div className="col-span-1 lg:col-span-4">
          <div className="sticky top-20">
            <CollegeSidebar profile={profile} slugId={slugId} />
          </div>
        </div>
      </div>
    </div>
  );
}
