"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileAboutCardProps {
  bio?: string | null;
}

export function ProfileAboutCard({ bio }: ProfileAboutCardProps) {
  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">About</CardTitle>
      </CardHeader>
      <CardContent>
        {bio?.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No bio available.</p>
        )}
      </CardContent>
    </Card>
  );
}
