"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { type GroupInvitation } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { getUserProfilePath } from "../../utils/author-navigation";

interface SentInvitationCardProps {
  invitation: GroupInvitation;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function SentInvitationCard({
  invitation,
  onCancel,
  isProcessing,
}: SentInvitationCardProps) {
  // invitedUser should be present for sent invitations
  const user = invitation.invitedUser || {
    id: "unknown",
    name: "Unknown User",
    image: null,
  };
  const profilePath = user.handle ? getUserProfilePath(user.handle) : null;

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image || undefined} />
          <AvatarFallback>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {profilePath ? (
              <Link
                href={profilePath}
                className="font-medium hover:underline truncate"
              >
                {user.name}
              </Link>
            ) : (
              <span className="font-medium truncate">{user.name}</span>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline-block">
              • Sent {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="text-xs text-muted-foreground sm:hidden mt-0.5">
             Sent {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={onCancel}
        disabled={isProcessing}
        className="ml-4 shrink-0 h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
      >
        <X className="h-3.5 w-3.5 mr-1.5" />
        Cancel
      </Button>
    </div>
  );
}
