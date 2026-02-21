"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { type EducationEntry } from "@/api/profile/profile-api";

interface ProfileEducationCardProps {
  education?: EducationEntry[] | null;
}

function formatYearRange(startYear?: number | null, endYear?: number | null): string | null {
  if (!startYear && !endYear) return null;
  const start = startYear ? String(startYear) : "";
  const end = endYear ? String(endYear) : "Present";
  return start && end ? `${start} - ${end}` : start || end;
}

export function ProfileEducationCard({ education }: ProfileEducationCardProps) {
  const entries = education ?? [];

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Education</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education listed yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const years = formatYearRange(entry.startYear, entry.endYear);

              return (
                <div
                  key={entry.id}
                  className={`${index < entries.length - 1 ? "border-b border-border pb-4" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{entry.collegeName || "Institution"}</p>
                      {entry.courseName ? (
                        <p className="text-sm text-muted-foreground">{entry.courseName}</p>
                      ) : null}
                      {entry.fieldOfStudy ? (
                        <p className="text-xs text-muted-foreground">{entry.fieldOfStudy}</p>
                      ) : null}
                      {years ? <p className="mt-0.5 text-xs text-muted-foreground">{years}</p> : null}
                      {entry.grade ? <p className="mt-0.5 text-xs text-muted-foreground">Grade: {entry.grade}</p> : null}
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
