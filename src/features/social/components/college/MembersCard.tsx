import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CollegeMember } from "../../types";

interface MembersCardProps {
  members: CollegeMember[];
  totalCount: number;
}

export const MembersCard: React.FC<MembersCardProps> = ({
  members,
  totalCount,
}) => {
  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-bold">
            {totalCount.toLocaleString()} members
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-3 mb-4 overflow-hidden">
          {members.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="border-2 border-background w-10 h-10">
              <AvatarImage src={member.user.image} alt={member.user.name} />
              <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {totalCount > 5 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-xs font-medium">
              +{totalCount - 5}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-full text-sm">
            Invite connections
          </Button>
          <Button variant="ghost" className="w-full text-sm font-semibold hover:bg-transparent px-0 text-left justify-start">
            Show all
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
