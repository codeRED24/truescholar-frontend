"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGroups, useMyGroups, useMyInvitations } from "@/features/social/hooks/use-groups-list";
import { GroupCard } from "@/features/social/components/groups/GroupCard";
import { CreateGroupDialog } from "@/features/social/components/groups/CreateGroupDialog";
import { MyInvitationsCard } from "@/features/social/components/groups/MyInvitationsCard";
import { Skeleton } from "@/components/ui/skeleton";

// Simple debounce fallback
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("my-groups");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounceValue(search, 500);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Queries
  const myGroupsQuery = useMyGroups();
  const discoverQuery = useGroups({ search: debouncedSearch });
  const invitationsQuery = useMyInvitations();

  // Infinite scroll for discover tab
  const { ref: discoverRef, inView: discoverInView } = useInView();
  
  useEffect(() => {
    if (discoverInView && discoverQuery.hasNextPage && !discoverQuery.isFetchingNextPage) {
      discoverQuery.fetchNextPage();
    }
  }, [discoverInView, discoverQuery.hasNextPage, discoverQuery.isFetchingNextPage, discoverQuery.fetchNextPage]);

  const invitationCount = invitationsQuery.data?.total || 0;
  
  // Helper to render loading skeletons
  const renderSkeletons = (count = 3) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Discover and join communities that share your interests.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitationCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {invitationCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* My Groups Tab */}
          <TabsContent value="my-groups" className="space-y-6">
            {myGroupsQuery.isLoading ? (
              renderSkeletons()
            ) : myGroupsQuery.data?.pages[0]?.groups.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/20">
                <h3 className="text-lg font-medium">You haven't joined any groups yet</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Explore public groups or create your own community.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("discover")}>
                  Discover Groups
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myGroupsQuery.data?.pages.flatMap((page) => page.groups).map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    userRole={group.userRole}
                    showJoinButton={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {discoverQuery.isLoading ? (
              renderSkeletons()
            ) : discoverQuery.data?.pages[0]?.groups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No groups found matching "{search}"
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverQuery.data?.pages.flatMap((page) => page.groups).map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group}
                    userRole={group.userRole}
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={discoverRef} className="h-4" />
            {discoverQuery.isFetchingNextPage && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            {invitationsQuery.isLoading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : (
              <MyInvitationsCard invitations={invitationsQuery.data?.invitations || []} />
            )}
          </TabsContent>
        </div>
      </Tabs>

      <CreateGroupDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
      />
    </div>
  );
}
