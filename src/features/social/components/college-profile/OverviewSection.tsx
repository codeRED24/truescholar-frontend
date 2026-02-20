"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CollegeProfileResponse } from "../../types";

interface OverviewSectionProps {
  profile: CollegeProfileResponse;
  slugId: string;
}

export function OverviewSection({ profile, slugId }: OverviewSectionProps) {
  const { college } = profile;

  if (!college.tagline) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {college.tagline}
        </p>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/feed/colleges/${slugId}/about`}>Show all details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
