import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface SidebarProfileProps {
  user: {
    name: string;
    handle: string;
    image?: string;
    banner?: string;
    headline?: string;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
}

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors group cursor-pointer">
    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
      {label}
    </span>
    <span className="text-xs font-semibold text-primary">{value}</span>
  </div>
);

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  user,
  stats,
}) => {
  return (
    <Card className="overflow-hidden border border-border shadow-sm bg-card rounded-xl">
      <div className="h-16 bg-gradient-to-r from-primary/60 to-primary relative">
        {user.banner && (
          <img
            src={user.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <CardContent className="pt-0 relative pb-2 px-0">
        <div className="-mt-8 mb-3 flex flex-col items-center px-4">
          <Avatar className="w-16 h-16 border-4 border-background shadow-sm">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center mt-2">
            <h3 className="font-bold text-base leading-tight hover:underline cursor-pointer">
              {user.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {user.headline}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-2 mt-4 px-2">
          <StatItem label="Connections" value={stats.followers} />
          <StatItem label="Who viewed your profile" value={stats.posts * 5} />
        </div>
      </CardContent>
    </Card>
  );
};
