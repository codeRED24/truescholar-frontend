"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { type GroupInvitation } from "../../types";
import { useAcceptInvitation, useDeclineInvitation } from "../../hooks/use-groups-list";
import { toast } from "sonner";

interface MyInvitationsCardProps {
  invitations: GroupInvitation[];
}

export function MyInvitationsCard({ invitations }: MyInvitationsCardProps) {
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptMutation.mutateAsync(invitationId);
      toast.success("Invitation accepted!");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleDecline = async (invitationId: string) => {
    try {
      await declineMutation.mutateAsync(invitationId);
      toast.success("Invitation declined");
    } catch (error) {
      toast.error("Failed to decline invitation");
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No pending invitations
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 rounded-lg">
                <AvatarImage src={invitation.groupLogo || undefined} />
                <AvatarFallback className="rounded-lg">
                  {invitation.groupName?.charAt(0).toUpperCase() || "G"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{invitation.groupName || "Unknown Group"}</h3>
                <p className="text-sm text-muted-foreground">
                  Invited by {invitation.invitedBy?.name || "Unknown"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
