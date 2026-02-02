import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCollegeProfile,
  getCollegeAbout,
  getCollegeAlumni,
  getCollegePosts,
  followCollege,
  unfollowCollege,
} from "../api/social-api";
import { type CollegeProfileResponse } from "../types";

export function useCollegeProfile(slugId: string) {
  return useQuery({
    queryKey: ["college-profile", slugId],
    queryFn: async () => {
      const response = await getCollegeProfile(slugId);
      if ("error" in response) throw new Error(response.error);
      return response.data;
    },
    enabled: !!slugId,
  });
}

export function useCollegeAbout(slugId: string) {
  return useQuery({
    queryKey: ["college-about", slugId],
    queryFn: async () => {
      const response = await getCollegeAbout(slugId);
      if ("error" in response) throw new Error(response.error);
      return response.data;
    },
    enabled: !!slugId,
  });
}

export function useCollegeAlumni(slugId: string) {
  return useInfiniteQuery({
    queryKey: ["college-alumni", slugId],
    queryFn: async ({ pageParam }) => {
      const response = await getCollegeAlumni(slugId, pageParam);
      if ("error" in response) throw new Error(response.error);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!slugId,
  });
}

export function useCollegePosts(slugId: string) {
  return useInfiniteQuery({
    queryKey: ["college-posts", slugId],
    queryFn: async ({ pageParam }) => {
      const response = await getCollegePosts(slugId, pageParam);
      if ("error" in response) throw new Error(response.error);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!slugId,
  });
}

export function useFollowCollege(slugId: string, collegeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await followCollege(collegeId);
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["college-profile", slugId] });
      const previousProfile = queryClient.getQueryData<CollegeProfileResponse>(["college-profile", slugId]);

      if (previousProfile) {
        queryClient.setQueryData<CollegeProfileResponse>(["college-profile", slugId], {
          ...previousProfile,
          college: {
            ...previousProfile.college,
            isFollowing: true,
          },
        });
      }
      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["college-profile", slugId], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["college-profile", slugId] });
    },
  });
}

export function useUnfollowCollege(slugId: string, collegeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await unfollowCollege(collegeId);
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["college-profile", slugId] });
      const previousProfile = queryClient.getQueryData<CollegeProfileResponse>(["college-profile", slugId]);

      if (previousProfile) {
        queryClient.setQueryData<CollegeProfileResponse>(["college-profile", slugId], {
          ...previousProfile,
          college: {
            ...previousProfile.college,
            isFollowing: false,
          },
        });
      }
      return { previousProfile };
    },
    onError: (err, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["college-profile", slugId], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["college-profile", slugId] });
    },
  });
}

