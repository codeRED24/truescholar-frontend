"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateGroup } from "../../hooks/use-groups-list";
import { toast } from "sonner";
import { type GroupType, type GroupPrivacy } from "../../types";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const router = useRouter();
  const createMutation = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GroupType>("public");
  const [privacy, setPrivacy] = useState<GroupPrivacy>("visible");
  const [rules, setRules] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        privacy: type === "private" ? privacy : undefined,
        rules: rules.trim() || undefined,
      });

      toast.success("Group created successfully!");
      onOpenChange(false);
      router.push(`/feed/groups/${result.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group");
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setName("");
      setDescription("");
      setType("public");
      setPrivacy("visible");
      setRules("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Group Type */}
          <div className="space-y-2">
            <Label>Group Type *</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as GroupType)}>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                <RadioGroupItem value="public" id="type-public" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="type-public" className="font-medium cursor-pointer">
                    Public
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can find this group and join instantly
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                <RadioGroupItem value="private" id="type-private" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="type-private" className="font-medium cursor-pointer">
                    Private
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Members must be approved or invited to join
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Privacy (only for private groups) */}
          {type === "private" && (
            <div className="space-y-2">
              <Label>Privacy</Label>
              <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as GroupPrivacy)}>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="visible" id="privacy-visible" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="privacy-visible" className="font-medium cursor-pointer">
                      Visible
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can find this group and request to join
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="hidden" id="privacy-hidden" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="privacy-hidden" className="font-medium cursor-pointer">
                      Hidden
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only members can find this group. Others must be invited.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Rules */}
          <div className="space-y-2">
            <Label htmlFor="rules">Group Rules (optional)</Label>
            <Textarea
              id="rules"
              placeholder="Add rules for members to follow..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
