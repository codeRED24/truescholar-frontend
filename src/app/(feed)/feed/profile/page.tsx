"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { getMyProfileHandle } from "@/api/profile/profile-api";
import { getUserProfilePath } from "@/features/social/utils/author-navigation";

export default function ProfileRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const redirectToMyProfile = async () => {
      if (session?.user?.id) {
        const result = await getMyProfileHandle();
        if (!("error" in result) && result.handle) {
          router.replace(getUserProfilePath(result.handle));
          return;
        }
      }

      sessionStorage.setItem("redirectAfterLogin", "/feed/profile");
      router.replace("/signin");
    };

    void redirectToMyProfile();
  }, [isPending, router, session?.user?.id]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
