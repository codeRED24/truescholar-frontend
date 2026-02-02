import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CollegeInfo } from "../../types";
import { MapPin, Users, Plus } from "lucide-react";

interface CollegeHeaderProps {
  college: CollegeInfo;
  isMember?: boolean;
  isFollowing?: boolean;
  onJoin?: () => void;
  onFollow?: () => void;
}

export const CollegeHeader: React.FC<CollegeHeaderProps> = ({
  college,
  isMember,
  isFollowing,
  onJoin,
  onFollow,
}) => {
  return (
    <Card className="overflow-hidden border-border shadow-sm bg-card rounded-xl">
      {/* Banner */}
      <div className="h-48 bg-muted relative">
        {college.banner_img ? (
          <img
            src={college.banner_img}
            alt={college.college_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
        )}
      </div>

      {/* Profile Info Area */}
      <div className="px-6 pb-6">
        <div className="relative flex justify-between items-end">
          {/* Logo */}
          <div className="-mt-12 p-1 bg-background rounded-xl">
            <Avatar className="w-32 h-32 rounded-xl border-4 border-background shadow-md">
              <AvatarImage src={college.logo_img} alt={college.college_name} />
              <AvatarFallback className="rounded-xl text-2xl font-bold">
                {college.college_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            {!isMember && (
              <Button onClick={onJoin} className="rounded-full px-6">
                Join
              </Button>
            )}
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={onFollow}
              className="rounded-full px-6"
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{college.college_name}</h1>
          <p className="text-muted-foreground font-medium">
            {college.short_name && `${college.short_name} • `}
            College & University
          </p>
          
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
            {(college.city_name || college.state_name) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {college.city_name}
                  {college.city_name && college.state_name ? ", " : ""}
                  {college.state_name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{college.member_count?.toLocaleString() || 0} members</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
