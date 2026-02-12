"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Camera,
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
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

const PEOPLE_ALSO_VIEWED_PLACEHOLDERS = [
  { id: "1", name: "Aditi Sharma", title: "CS Student, IIT Delhi" },
  { id: "2", name: "Rahul Verma", title: "Product Designer, Bengaluru" },
];

const ACTIVITY_PLACEHOLDER_CONTENT = {
  posts: [
    {
      id: "post-1",
      title: "Post preview",
      body: "Recent activity placeholder. User posts will appear here once connected.",
    },
    {
      id: "post-2",
      title: "Post preview",
      body: "Another placeholder card matching the wireframe section layout.",
    },
  ],
  comments: [
    {
      id: "comment-1",
      title: "Comment preview",
      body: "Recent comments placeholder. Comment data is not wired in this iteration.",
    },
    {
      id: "comment-2",
      title: "Comment preview",
      body: "Comment activity block kept as static UI for this pass.",
    },
  ],
};

export default function ProfilePage() {
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
  const [publicProfileUrl, setPublicProfileUrl] = useState(
    `/feed/profile/${userId}`,
  );
  const [isCopied, setIsCopied] = useState(false);
  const [activityTab, setActivityTab] = useState<"posts" | "comments">("posts");

  const isOwner = session?.user?.id === userId;
  const currentUserId = session?.user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const result = await getPublicProfile(userId);
      if ("error" in result) {
        setError(result.error);
      } else {
        setProfile(result.profile);
        setProfileUser(result.user);
      }
      setIsLoading(false);
    };
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || isOwner) return;
      const result = await getFollowStatus(userId);
      if (!("error" in result)) {
        setIsFollowing(result.data.isFollowing);
      }
    };
    if (currentUserId && !isOwner) {
      checkFollowStatus();
    }
  }, [currentUserId, userId, isOwner]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicProfileUrl(`${window.location.origin}/feed/profile/${userId}`);
    }
  }, [userId]);

  const handleAvatarClick = () => {
    if (isOwner) {
      fileInputRef.current?.click();
    }
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
    if (!editName.trim()) return;
    setUpdateUserPending(true);
    try {
      await updateUser({ name: editName.trim() });
      setProfileUser((prev) =>
        prev ? { ...prev, name: editName.trim() } : prev,
      );
      setIsEditingName(false);
    } catch (saveError) {
      console.error("Failed to update name:", saveError);
    } finally {
      setUpdateUserPending(false);
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

  const handleCopyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  const experienceList = useMemo(
    () => profile?.experience ?? [],
    [profile?.experience],
  );
  const educationList = useMemo(
    () => profile?.education ?? [],
    [profile?.education],
  );
  const skillsList = useMemo(() => profile?.skills ?? [], [profile?.skills]);
  const hasLinks =
    !!profile?.linkedin_url ||
    !!profile?.twitter_url ||
    !!profile?.github_url ||
    !!profile?.website_url ||
    isOwner;

  const headline = useMemo(() => {
    const currentExperience =
      experienceList.find((entry) => entry.isCurrent) || experienceList[0];
    if (currentExperience) {
      return `${currentExperience.role} at ${currentExperience.company}`;
    }

    const latestEducation = educationList[0];
    if (latestEducation) {
      const course = latestEducation.courseName || "Student";
      const college = latestEducation.collegeName || "Academic Institution";
      return `${course} at ${college}`;
    }

    return "Building my profile";
  }, [educationList, experienceList]);

  if (isLoading || sessionPending) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,2fr)_320px]">
          <div className="space-y-4">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-52 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold">User not found</h1>
          <p className="mb-4 text-muted-foreground">
            This profile does not exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const initials =
    profileUser.name
      ?.split(" ")
      .map((namePart) => namePart[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const location = [profile?.city, profile?.state].filter(Boolean).join(", ");
  const joinedOn = new Date(profileUser.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_320px]">
          <div className="order-1 space-y-4">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <div className="h-20 border-b bg-muted/40 sm:h-24" />
              <CardContent className="relative px-4 pb-5 sm:px-6 sm:pb-6">
                <div className="absolute -top-10 left-4 sm:-top-12 sm:left-6">
                  <div className="group relative">
                    <Avatar
                      className={`h-20 w-20 border-2 border-background shadow-md sm:h-24 sm:w-24 ${
                        isOwner ? "cursor-pointer" : ""
                      }`}
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage src={profileUser.image || undefined} />
                      <AvatarFallback className="bg-linear-to-br from-primary to-primary/70 text-2xl font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {(isUploadingAvatar || isDeletingAvatar) && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}

                    {isOwner && !isUploadingAvatar && !isDeletingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={handleAvatarClick}
                          className="rounded-full bg-white/20 p-1.5 transition-colors hover:bg-white/30"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </button>
                        {profileUser.image && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAvatar();
                            }}
                            className="rounded-full bg-white/20 p-1.5 transition-colors hover:bg-red-500/80"
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
                </div>

                <div className="mb-4 flex justify-end gap-2 pt-3">
                  {!isOwner && (
                    <>
                      <Button
                        onClick={handleFollow}
                        disabled={isFollowLoading || !currentUserId}
                        variant={isFollowing ? "outline" : "default"}
                        className="rounded-full px-4"
                      >
                        {isFollowLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isFollowing ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full px-4"
                        disabled
                        title="Messaging is coming soon"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </>
                  )}
                  {isOwner && (
                    <Button
                      variant="outline"
                      className="rounded-full px-4"
                      onClick={() => router.push("/feed/profile")}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit profile
                    </Button>
                  )}
                </div>

                <div className="mt-8 sm:mt-10">
                  {isOwner ? (
                    <Dialog
                      open={isEditingName}
                      onOpenChange={(open) => {
                        setIsEditingName(open);
                        if (open) setEditName(profileUser.name || "");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold sm:text-3xl">
                          {profileUser.name}
                        </h1>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <h1 className="text-2xl font-semibold sm:text-3xl">
                      {profileUser.name}
                    </h1>
                  )}

                  <p className="mt-1 text-sm text-muted-foreground">{headline}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
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
                      Joined {joinedOn}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Analytics
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    Static placeholder
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="font-semibold text-primary">28 profile views</p>
                  <p className="text-muted-foreground">
                    Placeholder views in the last 7 days.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">3 post impressions</p>
                  <p className="text-muted-foreground">
                    Placeholder reach for recent posts.
                  </p>
                </div>
                <div>
                  <p className="font-semibold">16 search appearances</p>
                  <p className="text-muted-foreground">
                    Placeholder search visibility metric.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">About</CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner ? (
                  <ProfileBio
                    bio={profile?.bio || ""}
                    onSave={(bio) => handleProfileUpdate({ bio })}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {profile?.bio || "No bio available."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={activityTab === "posts" ? "default" : "outline"}
                    className="rounded-full px-5"
                    onClick={() => setActivityTab("posts")}
                  >
                    Posts
                  </Button>
                  <Button
                    size="sm"
                    variant={activityTab === "comments" ? "default" : "outline"}
                    className="rounded-full px-5"
                    onClick={() => setActivityTab("comments")}
                  >
                    Comments
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ACTIVITY_PLACEHOLDER_CONTENT[activityTab].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-border/80 p-3"
                    >
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {item.body}
                      </p>
                      <Button
                        variant="link"
                        className="mt-2 h-auto p-0 text-xs"
                        disabled
                      >
                        ...more
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <Button variant="ghost" className="w-full" disabled>
                    Show all
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Briefcase className="h-4 w-4" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner ? (
                  <ProfileExperience experience={experienceList} />
                ) : experienceList.length > 0 ? (
                  <div className="space-y-5">
                    {experienceList.map((experience) => (
                      <div key={experience.id} className="flex gap-3">
                        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{experience.role}</p>
                          <p className="text-sm">{experience.company}</p>
                          <p className="text-xs text-muted-foreground">
                            {experience.startDate} -{" "}
                            {experience.isCurrent
                              ? "Present"
                              : experience.endDate || "Present"}
                          </p>
                          {experience.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {experience.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No experience listed.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner ? (
                  <ProfileEducation education={educationList} />
                ) : educationList.length > 0 ? (
                  <div className="space-y-5">
                    {educationList.map((education) => (
                      <div key={education.id} className="flex gap-3">
                        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                          <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">
                            {education.collegeName || "Institution"}
                          </p>
                          {education.courseName && (
                            <p className="text-sm">{education.courseName}</p>
                          )}
                          {education.fieldOfStudy && (
                            <p className="text-sm text-muted-foreground">
                              {education.fieldOfStudy}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {education.startYear || "-"} -{" "}
                            {education.endYear || "Present"}
                          </p>
                          {education.grade && (
                            <p className="text-xs text-muted-foreground">
                              Grade: {education.grade}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No education listed.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner ? (
                  <ProfileSkills
                    skills={skillsList}
                    onSave={(skills) => handleProfileUpdate({ skills })}
                  />
                ) : skillsList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-border/80 bg-muted/30 px-3 py-1.5 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed.</p>
                )}
              </CardContent>
            </Card>

            {hasLinks && (
              <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <LinkIcon className="h-4 w-4" />
                    Links
                  </CardTitle>
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
                    <div className="grid gap-3 sm:grid-cols-2">
                      {profile?.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border border-border/80 p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-sm font-bold text-blue-700">
                            in
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">LinkedIn</p>
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
                          className="flex items-center gap-2 rounded-md border border-border/80 p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-100 text-sm font-bold text-sky-700">
                            X
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Twitter / X</p>
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
                          className="flex items-center gap-2 rounded-md border border-border/80 p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-800">
                            GH
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">GitHub</p>
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
                          className="flex items-center gap-2 rounded-md border border-border/80 p-3 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100">
                            <LinkIcon className="h-4 w-4 text-green-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Website</p>
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

          <aside className="order-2 space-y-4">
            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Public profile & URL
                  </CardTitle>
                  <Button variant="ghost" size="icon" disabled>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5">
                  <p className="truncate text-sm text-muted-foreground">
                    {publicProfileUrl}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyProfileUrl}
                >
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  People also viewed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PEOPLE_ALSO_VIEWED_PLACEHOLDERS.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/80 p-2.5"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{person.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.title}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      View
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" className="w-full" disabled>
                  Show all
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
