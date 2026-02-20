"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { getUserProfilePath } from "@/features/social/utils/author-navigation";

export default function ProfileRedirect() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user?.id) {
        // Redirect to user's own profile
        router.replace(getUserProfilePath(session.user.id));
      } else {
        // Not logged in - redirect to sign in
        sessionStorage.setItem("redirectAfterLogin", "/feed/profile");
        router.replace("/signin");
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
