"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Shield, Users, Mail, Settings } from "lucide-react";
import { useGroupDetail } from "@/features/social/hooks/use-group-detail";
import { GroupSettingsForm } from "@/features/social/components/groups/GroupSettingsForm";
import { JoinRequestsList } from "@/features/social/components/groups/JoinRequestsList";
import { SentInvitationsList } from "@/features/social/components/groups/SentInvitationsList";
import { GroupMembersList } from "@/features/social/components/groups/GroupMembersList";
import { InviteMemberDialog } from "@/features/social/components/groups/InviteMemberDialog";
import { useState } from "react";

export default function GroupSettingsPage(props: {
  params: Promise<{ slugId: string }>;
}) {
  const params = use(props.params);
  const slugIdParam = params.slugId;

  // Extract UUID
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = slugIdParam.match(uuidPattern);
  const derivedId = match ? match[0] : slugIdParam;

  const router = useRouter();
  const { data: group, isLoading, error } = useGroupDetail(derivedId);
  const [inviteOpen, setInviteOpen] = useState(false);

  // URL Normalization
  if (group && !isLoading) {
    const canonicalUrl = `${group.slug}-${group.id}`;
    if (slugIdParam !== canonicalUrl && slugIdParam !== group.id) {
       // If user visited /settings with just ID or just slug, redirect to full URL
       // But strictly for settings page, maybe less critical than public profile.
       // We'll skip forced redirect here to avoid jitter, but ensure back links work.
    }
  }

  const backUrl = group ? `/feed/groups/${group.slug}-${group.id}` : `/feed/groups`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-xl font-bold">Group not found</h1>
        <Button variant="link" onClick={() => router.push("/feed/groups")}>
          Go back to groups
        </Button>
      </div>
    );
  }

  const role = group.userRole;
  const canManage = role === "owner" || role === "admin";

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mb-4">
          You don't have permission to manage this group.
        </p>
        <Button variant="outline" onClick={() => router.push(backUrl)}>
          Back to Group
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(backUrl)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Group
        </Button>
        <h1 className="text-2xl font-bold">Group Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Tabs defaultValue="general" className="col-span-12 lg:col-span-12 flex flex-col lg:flex-row gap-6">
          <TabsList className="flex lg:flex-col h-auto justify-start bg-transparent p-0 lg:w-64 space-y-1">
            <TabsTrigger 
              value="general" 
              className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Shield className="h-4 w-4 mr-2" />
              Join Requests
              {group.hasPendingRequest && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  •
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="invitations" 
              className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invitations
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="general" className="mt-0 space-y-6">
              <GroupSettingsForm group={group} />
            </TabsContent>

            <TabsContent value="members" className="mt-0 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Manage Members</h2>
                <Button onClick={() => setInviteOpen(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite People
                </Button>
              </div>
              <GroupMembersList slugId={group.id} currentUserRole={role} />
            </TabsContent>

            <TabsContent value="requests" className="mt-0 space-y-6">
              <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
              <JoinRequestsList groupId={group.id} />
            </TabsContent>

            <TabsContent value="invitations" className="mt-0 space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Sent Invitations</h2>
                <Button onClick={() => setInviteOpen(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite New
                </Button>
              </div>
              <SentInvitationsList groupId={group.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <InviteMemberDialog 
        groupId={group.id} 
        open={inviteOpen} 
        onOpenChange={setInviteOpen} 
      />
    </div>
  );
}
