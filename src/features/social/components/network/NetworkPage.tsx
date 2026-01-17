// Network Page Component
// Main page with tabs for suggestions, followers, and following (Twitter-style follow model)

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, UserPlus, UserCheck } from "lucide-react";
import {
  useSuggestions,
  useFollowers,
  useFollowing,
} from "../../hooks/use-network";
import { SuggestionCard } from "./SuggestionCard";
import { UserCard } from "./UserCard";

export function NetworkPage() {
  const [activeTab, setActiveTab] = useState("discover");

  const suggestions = useSuggestions(20);
  const followers = useFollowers(1, 50);
  const following = useFollowing(1, 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Network</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Discover and follow people to grow your network
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="discover" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Discover</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Followers</span>
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">People you may know</CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions.data && suggestions.data.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {suggestions.data.map((user) => (
                    <SuggestionCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No suggestions available</p>
                  <p className="text-sm mt-1">
                    Follow more people to get personalized suggestions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Following ({following.data?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {following.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : following.data && following.data.length > 0 ? (
                <div className="space-y-4">
                  {following.data.map((entry) => (
                    <UserCard key={entry.id} user={entry.user} showUnfollow />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>You're not following anyone yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Followers ({followers.data?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {followers.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : followers.data && followers.data.length > 0 ? (
                <div className="space-y-4">
                  {followers.data.map((entry) => (
                    <UserCard key={entry.id} user={entry.user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No followers yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
