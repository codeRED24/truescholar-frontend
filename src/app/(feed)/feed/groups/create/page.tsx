"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateGroup } from "@/features/social/hooks/use-groups-list";
import { toast } from "sonner";
import { type GroupType, type GroupPrivacy } from "@/features/social/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateGroupPage() {
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
      router.push(`/feed/groups/${result.slug}-${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create group");
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/feed/groups" className="text-sm text-muted-foreground hover:text-foreground flex items-center mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Groups
        </Link>
        <h1 className="text-2xl font-bold">Create a New Group</h1>
        <p className="text-muted-foreground">Build a community around a topic or interest.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Computer Science Class of 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this group about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
            </div>

            <div className="space-y-4 pt-2">
              <Label className="text-base">Group Type</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as GroupType)}>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer" onClick={() => setType("public")}>
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div>
                    <Label htmlFor="public" className="font-medium cursor-pointer">Public</Label>
                    <p className="text-sm text-muted-foreground">Anyone can find this group and join instantly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer" onClick={() => setType("private")}>
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div>
                    <Label htmlFor="private" className="font-medium cursor-pointer">Private</Label>
                    <p className="text-sm text-muted-foreground">Members must be approved or invited to join.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {type === "private" && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-base">Privacy</Label>
                <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as GroupPrivacy)}>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer" onClick={() => setPrivacy("visible")}>
                    <RadioGroupItem value="visible" id="visible" className="mt-1" />
                    <div>
                      <Label htmlFor="visible" className="font-medium cursor-pointer">Visible</Label>
                      <p className="text-sm text-muted-foreground">Anyone can find this group and request to join.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer" onClick={() => setPrivacy("hidden")}>
                    <RadioGroupItem value="hidden" id="hidden" className="mt-1" />
                    <div>
                      <Label htmlFor="hidden" className="font-medium cursor-pointer">Hidden</Label>
                      <p className="text-sm text-muted-foreground">Only members can find this group. Others must be invited.</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rules">Group Rules (optional)</Label>
              <Textarea
                id="rules"
                placeholder="1. Be respectful&#10;2. No spam"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                rows={4}
                maxLength={2000}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-6 bg-muted/20">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
