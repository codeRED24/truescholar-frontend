"use client";

import { NetworkPage } from "@/features/social/components/network";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function NetworkPageRoute() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/signin");
    }
  }, [isPending, session, router]);

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
