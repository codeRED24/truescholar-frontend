"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldOff, UserMinus } from "lucide-react";
import { type GroupMember, type GroupRole } from "../../types";
import { GroupRoleBadge } from "./GroupRoleBadge";
import { formatDistanceToNow } from "date-fns";
import { getUserProfilePath } from "../../utils/author-navigation";

interface GroupMemberCardProps {
  member: GroupMember;
  canManage?: boolean;
  currentUserRole?: GroupRole | null;
  onPromoteToAdmin?: () => void;
  onDemoteToMember?: () => void;
  onRemove?: () => void;
}

export function GroupMemberCard({
  member,
  canManage,
  currentUserRole,
  onPromoteToAdmin,
  onDemoteToMember,
  onRemove,
}: GroupMemberCardProps) {
  const isOwner = member.role === "owner";
  const isAdmin = member.role === "admin";
  const canEdit = canManage && currentUserRole === "owner" && !isOwner;
  const profilePath = getUserProfilePath(member.userId);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={member.user.image || undefined} />
        <AvatarFallback>
          {member.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={profilePath}
            className="font-medium hover:underline truncate"
          >
            {member.user.name}
          </Link>
          <GroupRoleBadge role={member.role} size="sm" />
        </div>
        <p className="text-xs text-muted-foreground">
          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
        </p>
      </div>

      {canEdit && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isAdmin && onPromoteToAdmin && (
              <DropdownMenuItem onClick={onPromoteToAdmin}>
                <Shield className="h-4 w-4 mr-2" />
                Make Admin
              </DropdownMenuItem>
            )}
            {isAdmin && onDemoteToMember && (
              <DropdownMenuItem onClick={onDemoteToMember}>
                <ShieldOff className="h-4 w-4 mr-2" />
                Remove Admin
              </DropdownMenuItem>
            )}
            {onRemove && (
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <UserMinus className="h-4 w-4 mr-2" />
                Remove from Group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
