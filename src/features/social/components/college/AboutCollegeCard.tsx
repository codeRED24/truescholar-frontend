import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AboutCollegeCardProps {
  description?: string;
}

export const AboutCollegeCard: React.FC<AboutCollegeCardProps> = ({
  description,
}) => {
  if (!description) return null;

  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold">About</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </CardContent>
    </Card>
  );
};
