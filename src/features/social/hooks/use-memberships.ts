// Memberships Hook
// Manages fetching and caching of user's college memberships

"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyCollegeMemberships } from "../api/social-api";
import { isApiError } from "../types";

export const membershipKeys = {
  all: ["social", "memberships"] as const,
  mine: () => [...membershipKeys.all, "me"] as const,
};

export function useCollegeMemberships() {
  return useQuery({
    queryKey: membershipKeys.mine(),
    queryFn: async () => {
      const result = await getMyCollegeMemberships();
      if (isApiError(result)) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
