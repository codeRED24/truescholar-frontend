"use client";

import { NetworkPage } from "@/features/social/components/network";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { redirectToSignIn } from "@/features/social/utils/auth-redirect";

export default function NetworkPageRoute() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      redirectToSignIn("/feed/network");
    }
  }, [isPending, session]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <NetworkPage />
    </div>
  );
}
