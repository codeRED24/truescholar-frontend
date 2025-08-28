"use client";

import { useState, useCallback } from "react";

type UserResponse = {
  message: string;
  data: any;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useUserApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async (input: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(input, init);
      const text = await res.text();
      let data: any = text;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // ignore
      }
      if (!res.ok) {
        const msg =
          data?.message || data?.error || res.statusText || "Request failed";
        setError(msg);
        throw new Error(msg);
      }
      return data;
    } catch (err: any) {
      setError(err?.message || "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserByEmail = useCallback(
    async (email: string): Promise<UserResponse> => {
      const url = `${API_BASE}/users/by-email/${encodeURIComponent(email)}`;
      return handleFetch(url, { method: "GET" }) as Promise<UserResponse>;
    },
    [handleFetch]
  );

  const getUserByPhone = useCallback(
    async (phone: string): Promise<UserResponse> => {
      const url = `${API_BASE}/users/by-phone/${encodeURIComponent(phone)}`;
      return handleFetch(url, { method: "GET" }) as Promise<UserResponse>;
    },
    [handleFetch]
  );

  return {
    loading,
    error,
    getUserByEmail,
    getUserByPhone,
  };
}

export default useUserApi;
