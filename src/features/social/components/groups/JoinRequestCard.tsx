"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { type GroupJoinRequest } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { getUserProfilePath } from "../../utils/author-navigation";

interface JoinRequestCardProps {
  request: GroupJoinRequest;
  onApprove: () => void;
  onReject: () => void;
  isProcessing?: boolean;
}

export function JoinRequestCard({
  request,
  onApprove,
  onReject,
  isProcessing,
}: JoinRequestCardProps) {
  const profilePath = getUserProfilePath(request.userId);

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10 mt-1">
        <AvatarImage src={request.userImage || undefined} />
        <AvatarFallback>
          {request.userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={profilePath}
            className="font-medium hover:underline truncate"
          >
            {request.userName}
          </Link>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>

        {request.message && (
          <p className="text-sm text-muted-foreground mt-1 break-words">
            &ldquo;{request.message}&rdquo;
          </p>
        )}

        <div className="flex items-center gap-2 mt-3">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isProcessing}
            className="h-8"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReject}
            disabled={isProcessing}
            className="h-8"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
