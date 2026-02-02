"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useGroupSuggestions } from "../../hooks/use-groups";
import { Loader2 } from "lucide-react";

export function PeopleAlsoViewedCard() {
  const { data: suggestions, isLoading } = useGroupSuggestions(3);

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">People also viewed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((college) => {
          const slug = college.slug
            ? `${college.slug}-${college.college_id}`
            : `${college.college_id}`;

          return (
            <div key={college.college_id} className="flex items-center gap-3">
              <Link href={`/feed/colleges/${slug}`}>
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={college.logo_img ?? undefined}
                    alt={college.college_name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {college.college_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/feed/colleges/${slug}`}
                  className="font-medium text-sm truncate block hover:underline"
                >
                  {college.college_name}
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {college.member_count?.toLocaleString()} members
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-8">
                Follow
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
