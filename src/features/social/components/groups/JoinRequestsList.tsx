"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { useJoinRequests, useApproveJoinRequest, useRejectJoinRequest } from "../../hooks/use-group-admin";
import { JoinRequestCard } from "./JoinRequestCard";
import { toast } from "sonner";

interface JoinRequestsListProps {
  groupId: string;
}

export function JoinRequestsList({ groupId }: JoinRequestsListProps) {
  const { ref, inView } = useInView();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useJoinRequests(groupId);

  const approveMutation = useApproveJoinRequest(groupId);
  const rejectMutation = useRejectJoinRequest(groupId);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleApprove = async (requestId: string) => {
    try {
      await approveMutation.mutateAsync(requestId);
      toast.success("Request approved");
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
      toast.success("Request rejected");
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const requests = data?.pages.flatMap((page) => page.requests) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-muted-foreground">
          No pending requests
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Join Requests ({total})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <JoinRequestCard
            key={request.id}
            request={request}
            onApprove={() => handleApprove(request.id)}
            onReject={() => handleReject(request.id)}
            isProcessing={approveMutation.isPending || rejectMutation.isPending}
          />
        ))}

        {/* Infinite scroll trigger */}
        <div ref={ref} className="h-4" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
