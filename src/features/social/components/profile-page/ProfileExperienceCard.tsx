"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { type ExperienceEntry } from "@/api/profile/profile-api";

interface ProfileExperienceCardProps {
  experience?: ExperienceEntry[] | null;
}

function formatMonthYear(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function ProfileExperienceCard({ experience }: ProfileExperienceCardProps) {
  const entries = experience ?? [];

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Experience</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No experience listed yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const start = formatMonthYear(entry.startDate);
              const end = entry.isCurrent ? "Present" : formatMonthYear(entry.endDate);

              return (
                <div
                  key={entry.id}
                  className={`${index < entries.length - 1 ? "border-b border-border pb-4" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{entry.role}</p>
                      <p className="text-sm text-muted-foreground">{entry.company}</p>
                      {start ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {start}
                          {end ? ` - ${end}` : ""}
                        </p>
                      ) : null}
                      {entry.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
