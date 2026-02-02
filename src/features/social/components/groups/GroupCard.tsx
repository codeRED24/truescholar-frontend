"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, Lock } from "lucide-react";
import { type Group } from "../../types";
import { GroupRoleBadge } from "./GroupRoleBadge";
import { useJoinGroup } from "../../hooks/use-group-detail";
import { toast } from "sonner";

interface GroupCardProps {
  group: Group;
  userRole?: "owner" | "admin" | "member" | null;
  showJoinButton?: boolean;
}

export function GroupCard({ group, userRole, showJoinButton = true }: GroupCardProps) {
  const joinMutation = useJoinGroup(group.id);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await joinMutation.mutateAsync();
      toast.success("Joined group successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join group");
    }
  };

  const isMember = !!userRole;
  const isPublic = group.type === "public";

  return (
    <Link href={`/feed/groups/${group.slug}-${group.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Group Logo */}
            <Avatar className="h-14 w-14 rounded-lg">
              <AvatarImage src={group.logoImage || undefined} alt={group.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-lg">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Group Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{group.name}</h3>
                {!isPublic && <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              </div>

              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                {!isPublic && (
                  <span className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    Private
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {group.memberCount.toLocaleString()} {group.memberCount === 1 ? "member" : "members"}
                </span>
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {group.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-2">
              {isMember && userRole && (
                <GroupRoleBadge role={userRole} size="sm" />
              )}
              {!isMember && showJoinButton && isPublic && (
                <Button
                  size="sm"
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                >
                  {joinMutation.isPending ? "Joining..." : "Join"}
                </Button>
              )}
              {!isMember && showJoinButton && !isPublic && (
                <Button size="sm" variant="outline">
                  Request
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
