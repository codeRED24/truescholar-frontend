"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLACEHOLDER_ANALYTICS = [
  {
    title: "28 profile views",
    description: "Who viewed your profile in the last 7 days.",
    highlight: true,
  },
  {
    title: "3 post impressions",
    description: "Impressions on your recent profile activity.",
    highlight: false,
  },
  {
    title: "16 search appearances",
    description: "Times your profile appeared in search results.",
    highlight: false,
  },
];

export function ProfileAnalyticsCard() {
  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Analytics</CardTitle>
        <p className="text-xs text-muted-foreground">Private to you</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLACEHOLDER_ANALYTICS.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <p
                className={`text-sm font-semibold ${
                  item.highlight ? "text-primary-main" : "text-foreground"
                }`}
              >
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
