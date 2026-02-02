"use client";

import { useQuery } from "@tanstack/react-query";
import { getCollegeInfo, getCollegeMembers } from "../api/social-api";
import { isApiError } from "../types";

export const collegeKeys = {
  all: ["colleges"] as const,
  detail: (id: number) => [...collegeKeys.all, id] as const,
  members: (id: number) => [...collegeKeys.detail(id), "members"] as const,
};

export function useCollegeInfo(collegeId: number) {
  return useQuery({
    queryKey: collegeKeys.detail(collegeId),
    queryFn: async () => {
      const result = await getCollegeInfo(collegeId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    enabled: !!collegeId,
  });
}

export function useCollegeMembers(collegeId: number) {
  return useQuery({
    queryKey: collegeKeys.members(collegeId),
    queryFn: async () => {
      const result = await getCollegeMembers(collegeId);
      if (isApiError(result)) throw new Error(result.error);
      return result.data;
    },
    enabled: !!collegeId,
  });
}
