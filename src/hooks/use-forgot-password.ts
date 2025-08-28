"use client";

import { useState, useCallback } from "react";

type ForgotPasswordRequest = {
  email: string;
  password: string;
};

type ForgotPasswordResponse = {
  message: string;
  success?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async (input: string, init?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(input, init);
      const text = await res.text();
      // try parse json, fallback to text
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

  const forgotPassword = useCallback(
    async (requestData: ForgotPasswordRequest) => {
      const url = `${API_BASE}/auth/forgot-password`;
      return handleFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      }) as Promise<ForgotPasswordResponse>;
    },
    [handleFetch]
  );

  return {
    loading,
    error,
    forgotPassword,
  };
}

export default useForgotPassword;
