"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock, Users, MoreHorizontal, Settings, LogOut, Share2 } from "lucide-react";
import { type GroupDetail } from "../../types";
import { GroupRoleBadge } from "./GroupRoleBadge";

interface GroupHeaderProps {
  group: GroupDetail;
  onJoin?: () => void;
  onLeave?: () => void;
  onRequestJoin?: () => void;
  onCancelRequest?: () => void;
  onSettings?: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  isRequesting?: boolean;
}

export function GroupHeader({
  group,
  onJoin,
  onLeave,
  onRequestJoin,
  onCancelRequest,
  onSettings,
  isJoining,
  isLeaving,
  isRequesting,
}: GroupHeaderProps) {
  const isMember = group.isMember;
  const isOwner = group.userRole === "owner";
  const isAdmin = group.userRole === "admin" || isOwner;
  const isPublic = group.type === "public";

  const renderActionButton = () => {
    if (isMember) {
      return (
        <div className="flex items-center gap-2">
          <GroupRoleBadge role={group.userRole!} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Group
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Group Settings
                  </DropdownMenuItem>
                </>
              )}
              {!isOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={onLeave}
                    disabled={isLeaving}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLeaving ? "Leaving..." : "Leave Group"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    if (group.hasPendingRequest) {
      return (
        <Button variant="outline" onClick={onCancelRequest} disabled={isRequesting}>
          {isRequesting ? "Cancelling..." : "Cancel Request"}
        </Button>
      );
    }

    if (group.hasPendingInvitation) {
      return (
        <Button variant="outline" disabled>
          Invitation Pending
        </Button>
      );
    }

    if (isPublic) {
      return (
        <Button onClick={onJoin} disabled={isJoining}>
          {isJoining ? "Joining..." : "Join Group"}
        </Button>
      );
    }

    return (
      <Button onClick={onRequestJoin} disabled={isRequesting}>
        {isRequesting ? "Requesting..." : "Request to Join"}
      </Button>
    );
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl overflow-hidden">
        {group.bannerImage && (
          <img
            src={group.bannerImage}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Group Info */}
      <div className="px-4 sm:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
          {/* Logo */}
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl border-4 border-background shadow-lg">
            <AvatarImage src={group.logoImage || undefined} alt={group.name} />
            <AvatarFallback className="rounded-xl bg-primary text-primary-foreground text-2xl sm:text-3xl">
              {group.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Name & Meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{group.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              {!isPublic && (
                <span className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  Private Group
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.memberCount.toLocaleString()} members
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
