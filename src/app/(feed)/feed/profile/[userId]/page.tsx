"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, updateUser } from "@/lib/auth-client";
import {
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  type UserProfile,
  type PublicProfileUser,
} from "@/api/profile/profile-api";
import {
  followUser,
  unfollowUser,
  getFollowStatus,
} from "@/features/social/api/social-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Calendar,
  Camera,
  Pencil,
  Trash2,
  ArrowLeft,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  ProfileBio,
  ProfileEducation,
  ProfileExperience,
  ProfileSkills,
  ProfileSocialLinks,
} from "@/components/profile";

export default function LinkedInStyleProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: session, isPending: sessionPending } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileUser, setProfileUser] = useState<PublicProfileUser | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [updateUserPending, setUpdateUserPending] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  const isOwner = session?.user?.id === userId;
  const currentUserId = session?.user?.id;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      const result = await getPublicProfile(userId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setProfile(result.profile);
        setProfileUser(result.user);
      }
      setIsLoading(false);
    };
    if (userId) fetchProfile();
  }, [userId]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || isOwner) return;
      const result = await getFollowStatus(userId);
      if (!("error" in result)) {
        setIsFollowing(result.data.isFollowing);
      }
    };
    if (currentUserId && !isOwner) checkFollowStatus();
  }, [currentUserId, userId, isOwner]);

  const handleAvatarClick = () => {
    if (isOwner) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5MB or less");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }
    setIsUploadingAvatar(true);
    const result = await uploadAvatar(file);
    if (!("error" in result)) {
      setProfileUser((prev) =>
        prev ? { ...prev, image: result.imageUrl } : prev,
      );
    }
    setIsUploadingAvatar(false);
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("Remove your profile photo?")) return;
    setIsDeletingAvatar(true);
    const result = await deleteAvatar();
    if (!("error" in result)) {
      setProfileUser((prev) => (prev ? { ...prev, image: null } : prev));
    }
    setIsDeletingAvatar(false);
  };

  const handleNameSave = async () => {
    if (editName.trim()) {
      setUpdateUserPending(true);
      try {
        await updateUser({ name: editName.trim() });
        setProfileUser((prev) =>
          prev ? { ...prev, name: editName.trim() } : prev,
        );
        setIsEditingName(false);
      } catch (error) {
        console.error("Failed to update name:", error);
      } finally {
        setUpdateUserPending(false);
      }
    }
  };

  const handleProfileUpdate = async (
    updates: Parameters<typeof updateProfile>[0],
  ) => {
    const result = await updateProfile(updates);
    if (!("error" in result)) {
      setProfile(result.profile);
    }
  };

  const handleFollow = async () => {
    if (isFollowLoading || !currentUserId) return;
    setIsFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        const result = await unfollowUser(userId);
        if ("error" in result) setIsFollowing(true);
      } else {
        const result = await followUser(userId);
        if ("error" in result) setIsFollowing(false);
      }
    } catch {
      setIsFollowing(wasFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading || sessionPending) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">User not found</h1>
          <p className="text-muted-foreground mb-4">
            This profile doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const initials =
    profileUser.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Hero Card - LinkedIn style header */}
        <Card className="overflow-hidden border shadow-sm">
          {/* Cover/Banner */}
          <div className="h-32 sm:h-48 bg-linear-to-r from-primary/80 via-primary to-primary/60 relative">
            {isOwner && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 opacity-80 hover:opacity-100"
              >
                <Camera className="h-4 w-4 mr-1" />
                Edit cover
              </Button>
            )}
          </div>

          <CardContent className="relative pb-6">
            {/* Avatar - overlapping the banner */}
            <div className="absolute -top-16 sm:-top-20 left-6">
              <div className="relative group">
                <Avatar
                  className={`h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-xl ${
                    isOwner ? "cursor-pointer" : ""
                  }`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={profileUser.image || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-white text-4xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {(isUploadingAvatar || isDeletingAvatar) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}

                {isOwner && !isUploadingAvatar && !isDeletingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleAvatarClick}
                      className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                    {profileUser.image && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAvatar();
                        }}
                        className="p-2.5 rounded-full bg-white/20 hover:bg-red-500/80 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
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
            </div>

            {/* Action buttons - top right */}
            <div className="flex justify-end gap-2 mb-4 pt-2">
              {currentUserId && !isOwner && (
                <Button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  variant={isFollowing ? "outline" : "default"}
                  className="rounded-full px-6"
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => router.push("/feed/profile")}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit profile
                </Button>
              )}
            </div>

            {/* User info */}
            <div className="mt-12 sm:mt-16">
              <div className="flex items-start justify-between">
                <div>
                  {isOwner ? (
                    <Dialog
                      open={isEditingName}
                      onOpenChange={(open) => {
                        setIsEditingName(open);
                        if (open) setEditName(profileUser.name || "");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold">
                          {profileUser.name}
                        </h1>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </div>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Name</DialogTitle>
                          <DialogDescription>
                            Update your display name
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Your name"
                        />
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
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      {profileUser.name}
                    </h1>
                  )}

                  {profile?.bio && (
                    <p className="text-muted-foreground mt-1 max-w-xl">
                      {profile.bio.slice(0, 120)}
                      {profile.bio.length > 120 ? "..." : ""}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileUser.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {new Date(profileUser.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">About</CardTitle>
            {isOwner && (
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <ProfileBio
                bio={profile?.bio || ""}
                onSave={(bio) => handleProfileUpdate({ bio })}
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profile?.bio || "No bio available."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Experience
            </CardTitle>
            {isOwner && (
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <ProfileExperience experience={profile?.experience || []} />
            ) : profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-6">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                      <Briefcase className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{exp.role}</h4>
                      <p className="text-sm">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exp.startDate} –{" "}
                        {exp.isCurrent ? "Present" : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No experience listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
            {isOwner && (
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <ProfileEducation education={profile?.education || []} />
            ) : profile?.education && profile.education.length > 0 ? (
              <div className="space-y-6">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {edu.collegeName || "Institution"}
                      </h4>
                      {edu.courseName && (
                        <p className="text-sm">{edu.courseName}</p>
                      )}
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-muted-foreground">
                          {edu.fieldOfStudy}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {edu.startYear} – {edu.endYear || "Present"}
                      </p>
                      {edu.grade && (
                        <p className="text-xs text-muted-foreground">
                          Grade: {edu.grade}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No education listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Skills</CardTitle>
            {isOwner && (
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isOwner ? (
              <ProfileSkills
                skills={profile?.skills || []}
                onSave={(skills) => handleProfileUpdate({ skills })}
              />
            ) : profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No skills listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Contact & Links Section */}
        {(profile?.linkedin_url ||
          profile?.twitter_url ||
          profile?.github_url ||
          profile?.website_url ||
          isOwner) && (
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Links
              </CardTitle>
              {isOwner && (
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <ProfileSocialLinks
                  linkedinUrl={profile?.linkedin_url || ""}
                  twitterUrl={profile?.twitter_url || ""}
                  githubUrl={profile?.github_url || ""}
                  websiteUrl={profile?.website_url || ""}
                  onSave={(links) => handleProfileUpdate(links)}
                />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          in
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">LinkedIn</p>
                        <p className="text-xs text-muted-foreground">
                          View profile
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {profile?.twitter_url && (
                    <a
                      href={profile.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-sky-100 flex items-center justify-center">
                        <span className="text-sky-500 font-bold text-sm">
                          X
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Twitter / X</p>
                        <p className="text-xs text-muted-foreground">
                          View profile
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-800 font-bold text-sm">
                          GH
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">GitHub</p>
                        <p className="text-xs text-muted-foreground">
                          View profile
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  {profile?.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center">
                        <LinkIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Website</p>
                        <p className="text-xs text-muted-foreground">
                          Visit site
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
