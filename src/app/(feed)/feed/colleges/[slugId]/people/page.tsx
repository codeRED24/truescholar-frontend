"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCollegeAlumni } from "@/features/social/hooks/use-college-profile";
import { Loader2 } from "lucide-react";

export default function CollegePeoplePage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugId = params.slugId;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCollegeAlumni(slugId);
  const alumni = data?.pages.flatMap((page) => page.people) || [];

  if (isLoading) {
    return (
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>People</CardTitle>
      </CardHeader>
      <CardContent>
        {alumni.length > 0 ? (
          <div className="space-y-4">
            {alumni.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/feed/profile/${person.id}`}>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.image ?? undefined} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link
                      href={`/feed/profile/${person.id}`}
                      className="font-medium block hover:underline"
                    >
                      {person.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {person.handle
                        ? `@${person.handle}`
                        : person.role || "Member"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  Follow
                </Button>
              </div>
            ))}

            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load more
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No people found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
