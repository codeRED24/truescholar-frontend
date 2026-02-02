import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CollegeMember } from "../../types";

interface AdminsCardProps {
  admins: CollegeMember[];
}

export const AdminsCard: React.FC<AdminsCardProps> = ({ admins }) => {
  if (admins.length === 0) return null;

  return (
    <Card className="border-border shadow-sm bg-card rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">Admins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {admins.slice(0, 3).map((admin) => (
          <div key={admin.id} className="flex gap-3">
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={admin.user.image} alt={admin.user.name} />
              <AvatarFallback>{admin.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{admin.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {admin.user.headline || "College Administrator"}
              </p>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" className="w-full text-sm font-semibold hover:bg-transparent px-0 text-left justify-start">
          Show all
        </Button>
      </CardContent>
    </Card>
  );
};
