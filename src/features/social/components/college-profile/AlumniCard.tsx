"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCollegeAlumni } from "../../hooks/use-college-profile";
import { Loader2 } from "lucide-react";

interface AlumniCardProps {
  slugId: string;
}

export function AlumniCard({ slugId }: AlumniCardProps) {
  const { data, isLoading } = useCollegeAlumni(slugId);
  const alumni = data?.pages.flatMap((page) => page.people) || [];

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (alumni.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Alumni</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alumni.slice(0, 3).map((person) => (
          <div key={person.id} className="flex items-center gap-3">
            <Link href={`/profile/${person.id}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={person.image ?? undefined} />
                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${person.id}`}
                className="font-medium text-sm truncate block hover:underline"
              >
                {person.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {person.handle ? `@${person.handle}` : "Alumni"}
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full h-8">
              Follow
            </Button>
          </div>
        ))}
        <Button variant="ghost" className="w-full text-sm" asChild>
          <Link href={`/feed/colleges/${slugId}/people`}>Show all</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
