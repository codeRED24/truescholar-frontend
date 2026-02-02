"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users } from "lucide-react";
import { useGroupMembers } from "../../hooks/use-group-detail";
import { useUpdateMemberRole, useRemoveMember } from "../../hooks/use-group-admin";
import { GroupMemberCard } from "./GroupMemberCard";
import { type GroupRole } from "../../types";
import { toast } from "sonner";

interface GroupMembersListProps {
  slugId: string;
  currentUserRole?: GroupRole | null;
}

export function GroupMembersList({ slugId, currentUserRole }: GroupMembersListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGroupMembers(slugId);

  const updateRole = useUpdateMemberRole(slugId);
  const removeMember = useRemoveMember(slugId);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: "admin" });
      toast.success("Member promoted to admin");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDemoteToMember = async (userId: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: "member" });
      toast.success("Admin demoted to member");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync(userId);
      toast.success("Member removed from group");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const members = data?.pages.flatMap((page) => page.members) ?? [];
  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Members ({data?.pages[0]?.total ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {members.map((member) => (
            <GroupMemberCard
              key={member.id}
              member={member}
              canManage={canManage}
              currentUserRole={currentUserRole}
              onPromoteToAdmin={() => handlePromoteToAdmin(member.userId)}
              onDemoteToMember={() => handleDemoteToMember(member.userId)}
              onRemove={() => handleRemoveMember(member.userId)}
            />
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={ref} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No members yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
