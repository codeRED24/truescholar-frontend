"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { signIn } from "@/lib/auth-client";

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
      // Use Better Auth signIn
      const result = await signIn.email({
        email: identifier,
        password: password,
      });

      if (result.error) {
        const msg = result.error.message || "Invalid credentials";
        setError(msg);
        return { success: false, message: msg };
      }

      // Get user data from result
      const userData = result.data?.user;

      if (!userData) {
        const msg = "Login failed: no user data received";
        setError(msg);
        return { success: false, message: msg };
      }

      // Store user in Zustand
      const id = String(userData.id);
      const name = userData.name || "";
      const email = userData.email || "";
      const role = "student"; // Default role

      const u = { id, name, email, role };
      loginStore(u);

      return { success: true, data: { id, role } };
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
