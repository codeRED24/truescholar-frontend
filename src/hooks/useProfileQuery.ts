import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  uploadAvatar,
  deleteAvatar,
  type UserProfile,
  type UpdateProfileDto,
  type ExperienceEntry,
  type EducationEntry,
} from "@/api/profile/profile-api";
import { toast } from "sonner";

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

// Get profile hook
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const result = await getProfile();
      if ("error" in result) {
        // Return null for auth errors instead of throwing
        if (
          result.error.includes("Unauthorized") ||
          result.error.includes("401")
        ) {
          return null;
        }
        throw new Error(result.error);
      }
      return result.profile ?? null;
    },
    retry: false, // Don't retry on failure (auth errors)
  });
}

// Update profile hook
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateProfileDto) => {
      const result = await updateProfile(updates);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Add experience hook
export function useAddExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experience: Omit<ExperienceEntry, "id">) => {
      const result = await addExperience(experience);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Experience added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add experience");
    },
  });
}

// Update experience hook
export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ExperienceEntry>;
    }) => {
      const result = await updateExperience(id, updates);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Experience updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update experience");
    },
  });
}

// Delete experience hook
export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteExperience(id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Experience deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete experience");
    },
  });
}

// Add education hook
export function useAddEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (education: Omit<EducationEntry, "id">) => {
      const result = await addEducation(education);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Education added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add education");
    },
  });
}

// Update education hook
export function useUpdateEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EducationEntry>;
    }) => {
      const result = await updateEducation(id, updates);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Education updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update education");
    },
  });
}

// Delete education hook
export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEducation(id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      toast.success("Education deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete education");
    },
  });
}

// Upload avatar hook
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadAvatar(file);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.imageUrl;
    },
    onSuccess: () => {
      toast.success("Avatar uploaded successfully");
      // Reload page to refresh session with new image
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload avatar");
    },
  });
}

// Delete avatar hook
export function useDeleteAvatar() {
  return useMutation({
    mutationFn: async () => {
      const result = await deleteAvatar();
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result.success;
    },
    onSuccess: () => {
      toast.success("Avatar removed successfully");
      // Reload page to refresh session
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove avatar");
    },
  });
}
