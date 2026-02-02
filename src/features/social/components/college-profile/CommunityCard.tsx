"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CollegeProfileResponse } from "../../types";

interface CommunityCardProps {
  profile: CollegeProfileResponse;
}

export function CommunityCard({ profile }: CommunityCardProps) {
  const { college, group } = profile;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Community</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarImage src={college.logo ?? undefined} alt={college.name} />
            <AvatarFallback className="rounded-lg">
              {college.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{college.name} Community</p>
            <p className="text-sm text-muted-foreground">
              {group.memberCount.toLocaleString()} members
            </p>
          </div>
        </div>
        <Button className="w-full rounded-full" variant="outline" asChild>
          <Link href={`/feed/groups/${group.slugId}`}>Join</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
