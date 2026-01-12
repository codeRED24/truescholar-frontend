"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, updateUser } from "@/lib/auth-client";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from "@/hooks/useProfileQuery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Briefcase,
  GraduationCap,
  LogOut,
  ChevronsUpDown,
  Mail,
  Phone,
  Calendar,
  Camera,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  ProfileBio,
  ProfileEducation,
  ProfileExperience,
  ProfileSkills,
  ProfileSocialLinks,
} from "@/components/profile";
import Link from "next/link";

type TabType = "profile" | "experience" | "education";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [updateUserPending, setUpdateUserPending] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image must be 5MB or less");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  const handleNameSave = async () => {
    if (editName.trim()) {
      setUpdateUserPending(true);
      try {
        await updateUser({ name: editName.trim() });
        setIsEditingName(false);
        window.location.reload();
      } catch (error) {
        console.error("Failed to update name:", error);
      } finally {
        setUpdateUserPending(false);
      }
    }
  };

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      sessionStorage.setItem("redirectAfterLogin", "/profile");
      router.push("/signin");
    }
  }, [session, sessionPending, router]);

  const handleProfileUpdate = async (
    updates: Parameters<typeof updateProfileMutation.mutate>[0]
  ) => {
    updateProfileMutation.mutate(updates);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
  };

  if (sessionPending || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const navItems = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "experience" as TabType, label: "Experience", icon: Briefcase },
    { id: "education" as TabType, label: "Education", icon: GraduationCap },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0">
        <SidebarHeader className="border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <Link
                href="/"
                prefetch
                className="text-black py-1 rounded-full font-bold font-public focus:outline-hidden"
                aria-label="Go to homepage"
              >
                True<span className="text-primary-main">Scholar</span>
              </Link>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="rounded-lg"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/40 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || undefined} />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {session.user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session.user.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
                  align="start"
                  side="top"
                >
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[#fafafa]">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/40 bg-white/80 backdrop-blur-xs px-6">
          <SidebarTrigger className="-ml-2 text-neutral-800 hover:text-neutral-600" />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="font-semibold">
            {navItems.find((i) => i.id === activeTab)?.label}
          </h1>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === "profile" && (
              <>
                {/* Profile Header Card */}
                <Card className="overflow-hidden border-0 shadow-xs">
                  <div className="h-24 bg-linear-to-r bg-primary-main relative" />
                  <CardContent className="relative pt-0 pb-6 px-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-12">
                      <div className="relative group w-24 h-24 mx-auto sm:mx-0 shrink-0">
                        <Avatar
                          className="h-24 w-24 border-4 border-white shadow-lg cursor-pointer"
                          onClick={handleAvatarClick}
                        >
                          <AvatarImage src={session.user.image || undefined} />
                          <AvatarFallback className="bg-linear-to-br from-blue-500 to-indigo-600 text-white text-2xl font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Loading overlay - always visible when pending */}
                        {(uploadAvatarMutation.isPending ||
                          deleteAvatarMutation.isPending) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                          </div>
                        )}
                        {/* Hover overlay - only visible when not pending */}
                        {!uploadAvatarMutation.isPending &&
                          !deleteAvatarMutation.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={handleAvatarClick}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                title="Change photo"
                              >
                                <Camera className="h-4 w-4 text-white" />
                              </button>
                              {session.user.image && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Remove your profile photo?")) {
                                      deleteAvatarMutation.mutate();
                                    }
                                  }}
                                  className="p-2 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
                                  title="Remove photo"
                                >
                                  <Trash2 className="h-4 w-4 text-white" />
                                </button>
                              )}
                            </div>
                          )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <div className="flex-1 sm:pb-2 text-center sm:text-left">
                        <Dialog
                          open={isEditingName}
                          onOpenChange={(open) => {
                            setIsEditingName(open);
                            if (open) setEditName(session.user.name || "");
                          }}
                        >
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <h2 className="text-xl font-semibold">
                              {session.user.name}
                            </h2>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-neutral-500 hover:text-neutral-600"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                          </div>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Name</DialogTitle>
                              <DialogDescription>
                                Update your display name
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Your name"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingName(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleNameSave}
                                disabled={updateUserPending}
                              >
                                {updateUserPending ? "Saving..." : "Save"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {session.user.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {session.user.phoneNumber
                            ? session.user.phoneNumber.startsWith("+")
                              ? session.user.phoneNumber
                              : `+${session.user.phoneNumber}`
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Joined{" "}
                          {new Date(
                            session.user.createdAt || Date.now()
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bio */}
                <Card className="border-0 shadow-xs">
                  <CardContent className="p-6">
                    <ProfileBio
                      bio={profile?.bio || ""}
                      onSave={(bio) => handleProfileUpdate({ bio })}
                    />
                  </CardContent>
                </Card>

                {/* Skills & Links Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-xs">
                    <CardContent className="p-6">
                      <ProfileSkills
                        skills={profile?.skills || []}
                        onSave={(skills) => handleProfileUpdate({ skills })}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xs">
                    <CardContent className="p-6">
                      <ProfileSocialLinks
                        linkedinUrl={profile?.linkedin_url || ""}
                        twitterUrl={profile?.twitter_url || ""}
                        githubUrl={profile?.github_url || ""}
                        websiteUrl={profile?.website_url || ""}
                        onSave={(links) => handleProfileUpdate(links)}
                      />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeTab === "experience" && (
              <ProfileExperience experience={profile?.experience || []} />
            )}

            {activeTab === "education" && (
              <ProfileEducation education={profile?.education || []} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
