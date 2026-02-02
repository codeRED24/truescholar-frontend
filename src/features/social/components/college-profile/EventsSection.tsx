"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EventsSection() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="h-32 bg-muted flex items-center justify-center text-muted-foreground">
                Event Image
              </div>
              <div className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <Button variant="outline" className="w-full rounded-full">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full" disabled>
          Show all events
        </Button>
      </CardContent>
    </Card>
  );
}
