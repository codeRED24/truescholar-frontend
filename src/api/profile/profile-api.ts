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

// Get user profile
export async function getProfile(): Promise<
  { profile: UserProfile } | { error: string }
> {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { error: "Failed to fetch profile" };
  }
}

// Get public profile by user ID
export interface PublicProfileUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt: string;
}

export async function getPublicProfile(
  userId: string
): Promise<
  { profile: UserProfile; user: PublicProfileUser } | { error: string }
> {
  try {
    const response = await fetch(`${BASE_URL}/profile/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return { error: "Failed to fetch profile" };
  }
}

// Update profile
export async function updateProfile(
  updates: UpdateProfileDto
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}

// Add experience
export async function addExperience(
  experience: Omit<ExperienceEntry, "id">
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/experience`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(experience),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding experience:", error);
    return { error: "Failed to add experience" };
  }
}

// Update experience
export async function updateExperience(
  id: string,
  updates: Partial<ExperienceEntry>
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/experience/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating experience:", error);
    return { error: "Failed to update experience" };
  }
}

// Delete experience
export async function deleteExperience(
  id: string
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/experience/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting experience:", error);
    return { error: "Failed to delete experience" };
  }
}

// Add education
export async function addEducation(
  education: Omit<EducationEntry, "id">
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/education`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(education),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding education:", error);
    return { error: "Failed to add education" };
  }
}

// Update education
export async function updateEducation(
  id: string,
  updates: Partial<EducationEntry>
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/education/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating education:", error);
    return { error: "Failed to update education" };
  }
}

// Delete education
export async function deleteEducation(
  id: string
): Promise<{ profile: UserProfile } | { error: string }> {
  try {
    const response = await fetch(`${BASE_URL}/profile/education/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting education:", error);
    return { error: "Failed to delete education" };
  }
}

// Upload avatar
export async function uploadAvatar(
  file: File
): Promise<{ imageUrl: string } | { error: string }> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${BASE_URL}/profile/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return { error: "Failed to upload avatar" };
  }
}

// Delete avatar
export async function deleteAvatar(): Promise<
  { success: boolean } | { error: string }
> {
  try {
    const response = await fetch(`${BASE_URL}/profile/avatar`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return { error: "Failed to delete avatar" };
  }
}
