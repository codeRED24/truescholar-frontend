"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PeoplesSection() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Peoples</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
          People list coming soon
        </div>
      </CardContent>
    </Card>
  );
}
