"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { useInviteUser } from "../../hooks/use-group-admin";
import { searchHandles } from "../../api/social-api"; // Reuse handle search
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface InviteMemberDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserResult {
  id: string;
  name: string;
  image?: string;
  handle: string;
}

export function InviteMemberDialog({ groupId, open, onOpenChange }: InviteMemberDialogProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounceValue(query, 500);
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inviteMutation = useInviteUser(groupId);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const response = await searchHandles(debouncedQuery);
        if (!("error" in response)) {
          // Filter to only users (not colleges/companies)
          const users = response.data
            .filter((h) => h.entityType === "user")
            .map((h) => ({
              id: h.entityId,
              name: h.displayName,
              image: h.image,
              handle: h.handle,
            }));
          setResults(users);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleInvite = async (userId: string) => {
    try {
      await inviteMutation.mutateAsync(userId);
      toast.success("Invitation sent!");
      // Optionally remove from list or show invited state
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or handle..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="min-h-[200px] max-h-[300px] overflow-y-auto space-y-2">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.handle}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleInvite(user.id)}
                    disabled={inviteMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : query.trim() ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Search for people to invite
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
