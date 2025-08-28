"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";

type LoginResult =
  | { success: true; data: { id: string; role: string } }
  | { success: false; message?: string };

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginStore } = useUserStore();

  const login = async (
    identifier: string,
    password: string
  ): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.message || "Invalid credentials";
        setError(msg);
        return { success: false, message: msg };
      }

      const json = await res.json();

      const token = json?.access_token;
      const userData = json?.user;

      if (!token) {
        const msg = "Login failed: no token received";
        setError(msg);
        return { success: false, message: msg };
      }

      if (!userData) {
        const msg = "Login failed: no user data received";
        setError(msg);
        return { success: false, message: msg };
      }

      try {
        localStorage.setItem("access_token", token);
      } catch (e) {
        // ignore storage errors
      }

      // Use the user data from the response
      const id = String(userData.id);
      const name = userData.name || "";
      const email = userData.email || "";
      const user_type = userData.user_type || "student";
      const custom_code = userData.custom_code || "";

      const u = { id, name, email, role: user_type, custom_code };
      loginStore(u as any);

      return { success: true, data: { id, role: user_type } };
    } catch (err) {
      console.error("Login error", err);
      const msg = "Failed to login. Please try again.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error } as const;
}
