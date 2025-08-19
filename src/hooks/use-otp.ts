"use client";

import { useState, useCallback } from "react";

type SendOtpResponse = { message?: string };
type VerifyOtpResponse = { message?: string };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useOtpApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(
    async (input: string, init?: RequestInit) => {
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
          const msg = data?.message || data?.error || res.statusText || "Request failed";
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
    },
    []
  );

  const sendEmailOtp = useCallback(
    async (email: string) => {
      const url = `${API_BASE}/users/send-email-otp`;
      return handleFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }) as Promise<SendOtpResponse>;
    },
    [handleFetch]
  );

  const sendPhoneOtp = useCallback(
    async (phone: string, countryCode?: string) => {
  const url = `${API_BASE}/users/send-phone-otp`;
      return handleFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, countryCode }),
      }) as Promise<SendOtpResponse>;
    },
    [handleFetch]
  );

  const verifyEmailOtp = useCallback(
    async (email: string, email_otp: string) => {
  const url = `${API_BASE}/users/verify-email-otp`;
      return handleFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, email_otp }),
      }) as Promise<VerifyOtpResponse>;
    },
    [handleFetch]
  );

  const verifyPhoneOtp = useCallback(
    async (phone: string, phone_otp: string) => {
  const url = `${API_BASE}/users/verify-phone-otp`;
      return handleFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, phone_otp }),
      }) as Promise<VerifyOtpResponse>;
    },
    [handleFetch]
  );

  const isOtpVerified = useCallback(
    async (email: string, phone: string) => {
  const url = `${API_BASE}/users/is-otp-verified?email=${encodeURIComponent(
        email
      )}&phone=${encodeURIComponent(phone)}`;
      return handleFetch(url, { method: "GET" }) as Promise<{ verified: boolean }>;
    },
    [handleFetch]
  );

  return {
    loading,
    error,
    sendEmailOtp,
    sendPhoneOtp,
    verifyEmailOtp,
    verifyPhoneOtp,
    isOtpVerified,
  };
}

export default useOtpApi;
