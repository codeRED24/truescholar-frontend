import { fetchJson } from "@/lib/api-fetch";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

// Types for profile data
export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface EducationEntry {
  id: string;
  collegeId: number | null;
  collegeName?: string | null;
  courseId: number | null;
  courseName?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  grade?: string | null;
  description?: string | null;
}

export interface UserProfile {
  user_id: string;
  bio: string | null;
  experience: ExperienceEntry[] | null;
  education: EducationEntry[] | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  website_url: string | null;
  city: string | null;
  state: string | null;
  skills: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  bio?: string | null;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  linkedin_url?: string | null;
  twitter_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
  city?: string | null;
  state?: string | null;
  skills?: string[];
}

type ApiError = { error: string; statusCode?: number };

async function requestJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T | ApiError> {
  const result = await fetchJson<T>(`${BASE_URL}${path}`, options);
  if (result.error) {
    return { error: result.error };
  }
  return result.data ?? ({} as T);
}

function jsonOptions(method: string, body?: unknown): RequestInit {
  return {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
  };
}

// Get user profile
export async function getProfile(): Promise<
  { profile: UserProfile } | { error: string }
> {
  return requestJson<{ profile: UserProfile }>("/profile", jsonOptions("GET"));
}

// Get public profile by handle
export interface PublicProfileUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
  handle?: string | null;
}

export async function getPublicProfile(
  handle: string,
): Promise<
  { profile: UserProfile; user: PublicProfileUser } | { error: string }
> {
  return requestJson<{ profile: UserProfile; user: PublicProfileUser }>(
    `/profile/${handle}`,
    jsonOptions("GET"),
  );
}

export interface ProfileHandleResponse {
  handle: string;
  profileUrl: string;
}

export async function getMyProfileHandle(): Promise<
  ProfileHandleResponse | { error: string }
> {
  return requestJson<ProfileHandleResponse>(
    "/profile/handle/me",
    jsonOptions("GET"),
  );
}

export async function updateProfileHandle(
  handle: string,
): Promise<ProfileHandleResponse | { error: string; statusCode?: number }> {
  return requestJson<ProfileHandleResponse>(
    "/profile/handle",
    jsonOptions("PUT", { handle }),
  );
}

// Update profile
export async function updateProfile(
  updates: UpdateProfileDto,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    "/profile",
    jsonOptions("PUT", updates),
  );
}

// Add experience
export async function addExperience(
  experience: Omit<ExperienceEntry, "id">,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    "/profile/experience",
    jsonOptions("POST", experience),
  );
}

// Update experience
export async function updateExperience(
  id: string,
  updates: Partial<ExperienceEntry>,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    `/profile/experience/${id}`,
    jsonOptions("PUT", updates),
  );
}

// Delete experience
export async function deleteExperience(
  id: string,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    `/profile/experience/${id}`,
    jsonOptions("DELETE"),
  );
}

// Add education
export async function addEducation(
  education: Omit<EducationEntry, "id">,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    "/profile/education",
    jsonOptions("POST", education),
  );
}

// Update education
export async function updateEducation(
  id: string,
  updates: Partial<EducationEntry>,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    `/profile/education/${id}`,
    jsonOptions("PUT", updates),
  );
}

// Delete education
export async function deleteEducation(
  id: string,
): Promise<{ profile: UserProfile } | { error: string }> {
  return requestJson<{ profile: UserProfile }>(
    `/profile/education/${id}`,
    jsonOptions("DELETE"),
  );
}

// Upload avatar
export async function uploadAvatar(
  file: File,
): Promise<{ imageUrl: string } | { error: string }> {
  const formData = new FormData();
  formData.append("avatar", file);
  return requestJson<{ imageUrl: string }>("/profile/avatar", {
    method: "POST",
    body: formData,
  });
}

// Delete avatar
export async function deleteAvatar(): Promise<
  { success: boolean } | { error: string }
> {
  return requestJson<{ success: boolean }>(
    "/profile/avatar",
    jsonOptions("DELETE"),
  );
}
