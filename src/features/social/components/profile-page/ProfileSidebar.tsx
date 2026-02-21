"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileSidebarProps {
  userId: string;
}

const PLACEHOLDER_PEOPLE = [
  { id: "user-placeholder-1", name: "Aisha Khan", subtitle: "Product Designer" },
  { id: "user-placeholder-2", name: "Rahul Verma", subtitle: "UX Strategist" },
];

export function ProfileSidebar({ userId }: ProfileSidebarProps) {
  const publicProfilePath = `/feed/profile/${userId}`;
  const publicProfileLabel = `truescholar.com/feed/profile/${userId}`;

  return (
    <div className="space-y-4">
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Public profile & URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="break-all text-sm text-muted-foreground">{publicProfileLabel}</p>
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href={publicProfilePath}>View profile</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">People also viewed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLACEHOLDER_PEOPLE.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">{person.subtitle}</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 rounded-full px-3" disabled>
                View
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-muted-foreground" disabled>
            Show all
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
