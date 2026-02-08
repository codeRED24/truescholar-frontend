import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  getCollegeProfile,
  getCollegeAbout,
  getCollegeAlumni,
  getCollegePosts,
  followCollege,
  unfollowCollege,
} from "../api/social-api";
import { type CollegeProfileResponse } from "../types";
import { useFeedStore } from "../stores/feed-store";

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

export const collegePostsKeys = {
  all: ["college-posts"] as const,
  list: (slugId: string) => [...collegePostsKeys.all, slugId] as const,
};

export function useCollegePosts(slugId: string) {
  const reactionAuthor = useFeedStore((s) => s.reactionAuthor);
  const prevAuthorRef = useRef<{ type?: string; id?: string } | null>(null);

  const query = useInfiniteQuery({
    queryKey: collegePostsKeys.list(slugId),
    queryFn: async ({ pageParam }) => {
      const response = await getCollegePosts(
        slugId,
        pageParam,
        reactionAuthor?.type,
        reactionAuthor?.type === "college"
          ? parseInt(reactionAuthor.id)
          : undefined
      );
      if ("error" in response) throw new Error(response.error);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!slugId,
  });

  // Refetch when identity changes
  useEffect(() => {
    const prev = prevAuthorRef.current;
    const curr = reactionAuthor;

    // Skip initial render
    if (prev === null) {
      prevAuthorRef.current = curr;
      return;
    }

    // Refetch if identity changed
    if (prev?.id !== curr?.id || prev?.type !== curr?.type) {
      prevAuthorRef.current = curr;
      query.refetch();
    }
  }, [reactionAuthor, query]);

  return query;
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

