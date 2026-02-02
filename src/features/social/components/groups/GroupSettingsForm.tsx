"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateGroup, useDeleteGroup } from "../../hooks/use-group-admin";
import { type GroupDetail, type GroupType, type GroupPrivacy } from "../../types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GroupSettingsFormProps {
  group: GroupDetail;
}

export function GroupSettingsForm({ group }: GroupSettingsFormProps) {
  const router = useRouter();
  const updateMutation = useUpdateGroup(group.id);
  const deleteMutation = useDeleteGroup();

  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [type, setType] = useState<GroupType>(group.type);
  const [privacy, setPrivacy] = useState<GroupPrivacy>(group.privacy);
  const [rules, setRules] = useState(group.rules || "");
  const [bannerImage, setBannerImage] = useState(group.bannerImage || "");
  const [logoImage, setLogoImage] = useState(group.logoImage || "");

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        name,
        description,
        type,
        privacy: type === "private" ? privacy : undefined,
        rules,
        bannerImage,
        logoImage,
      });
      toast.success("Group settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(group.id);
      toast.success("Group deleted");
      router.push("/feed/groups");
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const isOwner = group.userRole === "owner";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Update your group's information and visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Group Type</Label>
              <RadioGroup value={type} onValueChange={(v) => setType(v as GroupType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="type-public" />
                  <Label htmlFor="type-public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="type-private" />
                  <Label htmlFor="type-private">Private</Label>
                </div>
              </RadioGroup>
            </div>

            {type === "private" && (
              <div className="space-y-2">
                <Label>Privacy</Label>
                <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as GroupPrivacy)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visible" id="privacy-visible" />
                    <Label htmlFor="privacy-visible">Visible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hidden" id="privacy-hidden" />
                    <Label htmlFor="privacy-hidden">Hidden</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rules">Group Rules</Label>
            <Textarea
              id="rules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="e.g. Be respectful, no spam..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Banner Image URL</Label>
            <Input
              id="banner"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo Image URL</Label>
            <Input
              id="logo"
              value={logoImage}
              onChange={(e) => setLogoImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {isOwner && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions. Be careful.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Group</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    group and remove all member data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
