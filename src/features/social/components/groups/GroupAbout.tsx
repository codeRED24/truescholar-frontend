"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { type GroupDetail } from "../../types";
import { formatDistanceToNow } from "date-fns";

interface GroupAboutProps {
  group: GroupDetail;
}

export function GroupAbout({ group }: GroupAboutProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      {group.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {group.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rules */}
      {group.rules && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Group Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {group.rules}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Meta Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
            </span>
          </div>
          {group.creator && (
            <p className="text-sm text-muted-foreground mt-1">
              by {group.creator.name}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
