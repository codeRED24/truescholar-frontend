"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfileHandle } from "@/api/profile/profile-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  normalizeProfileHandle,
  validateProfileHandle,
} from "@/features/social/utils/profile-handle";

interface ProfileSidebarProps {
  profileHandle: string;
  isOwner?: boolean;
  onHandleUpdated?: () => Promise<void> | void;
}

const PLACEHOLDER_PEOPLE = [
  { id: "user-placeholder-1", name: "Aisha Khan", subtitle: "Product Designer" },
  { id: "user-placeholder-2", name: "Rahul Verma", subtitle: "UX Strategist" },
];

export function ProfileSidebar({
  profileHandle,
  isOwner = false,
  onHandleUpdated,
}: ProfileSidebarProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draftHandle, setDraftHandle] = useState(profileHandle);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setDraftHandle(profileHandle);
  }, [profileHandle]);

  const normalizedHandle = useMemo(
    () => normalizeProfileHandle(draftHandle),
    [draftHandle],
  );
  const validationError = useMemo(
    () => validateProfileHandle(draftHandle),
    [draftHandle],
  );

  const publicProfilePath = `/feed/profile/${profileHandle}`;
  const publicProfileLabel = `truescholar.com/feed/profile/${profileHandle}`;

  const handleSave = async () => {
    if (validationError) return;
    setIsSaving(true);
    setSubmitError(null);

    try {
      const result = await updateProfileHandle(normalizedHandle);
      if ("error" in result) {
        const errorMessage =
          result.statusCode === 409
            ? "This profile URL is already taken."
            : result.error || "Unable to update profile URL";
        setSubmitError(errorMessage);
        return;
      }

      await onHandleUpdated?.();
      setIsDialogOpen(false);
      toast.success("Profile URL updated");
      router.replace(`/feed/profile/${result.handle}`);
    } catch {
      setSubmitError("Unable to update profile URL");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Public profile & URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="break-all text-sm text-muted-foreground">{publicProfileLabel}</p>
          <div className="grid grid-cols-1 gap-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href={publicProfilePath}>View profile</Link>
            </Button>
            {isOwner ? (
              <Button
                variant="ghost"
                className="w-full rounded-full"
                onClick={() => {
                  setSubmitError(null);
                  setIsDialogOpen(true);
                }}
              >
                Edit URL
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">People also viewed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLACEHOLDER_PEOPLE.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">{person.subtitle}</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 rounded-full px-3" disabled>
                View
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-muted-foreground" disabled>
            Show all
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile URL</DialogTitle>
            <DialogDescription>
              Choose a unique handle for your public profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              value={draftHandle}
              onChange={(event) => setDraftHandle(event.target.value)}
              placeholder="your_handle"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              URL preview: truescholar.com/feed/profile/{normalizedHandle || "your_handle"}
            </p>
            {validationError ? (
              <p className="text-xs text-destructive">{validationError}</p>
            ) : null}
            {submitError ? (
              <p className="text-xs text-destructive">{submitError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={Boolean(validationError) || isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
