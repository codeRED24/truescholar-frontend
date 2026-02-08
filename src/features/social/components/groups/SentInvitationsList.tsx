"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { useGroupInvitations, useCancelInvitation } from "../../hooks/use-group-admin";
import { SentInvitationCard } from "./SentInvitationCard";
import { toast } from "sonner";

interface SentInvitationsListProps {
  groupId: string;
}

export function SentInvitationsList({ groupId }: SentInvitationsListProps) {
  const {
    data,
    isLoading,
  } = useGroupInvitations(groupId);

  const cancelMutation = useCancelInvitation(groupId);

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelMutation.mutateAsync(invitationId);
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const invitations = data?.invitations ?? [];
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          No pending invitations
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Pending Invitations ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <SentInvitationCard
            key={invitation.id}
            invitation={invitation}
            onCancel={() => handleCancel(invitation.id)}
            isProcessing={cancelMutation.isPending}
          />
        ))}
      </CardContent>
    </Card>
  );
}
