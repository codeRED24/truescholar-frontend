"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PLACEHOLDER_ACTIVITY = [
  {
    title: "Designing for focus",
    description: "Activity data will appear here once profile activity APIs are connected.",
  },
  {
    title: "Shipping with intent",
    description: "This section is currently a placeholder for posts and comments.",
  },
];

export function ProfileActivityCard() {
  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-full px-5" disabled>
            Post
          </Button>
          <Button size="sm" variant="outline" className="rounded-full px-5" disabled>
            Comments
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {PLACEHOLDER_ACTIVITY.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-3 h-24 rounded-md border border-dashed border-neutral-300 bg-muted/30 dark:border-neutral-700" />
              <p className="mt-2 text-xs font-medium text-muted-foreground">...more</p>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full rounded-lg text-muted-foreground" disabled>
          Show all
        </Button>
      </CardContent>
    </Card>
  );
}
