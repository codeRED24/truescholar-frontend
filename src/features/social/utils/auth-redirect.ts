"use client";

import { setRedirectAfterLogin } from "@/lib/auth/redirect-after-login";

/**
 * Redirect to sign-in and preserve the current location for post-login return.
 */
export function redirectToSignIn(returnTo?: string) {
  if (typeof window === "undefined") return;

  setRedirectAfterLogin(returnTo);
  window.location.assign("/signin");
}

export function requireAuth(user: unknown, returnTo?: string): boolean {
  if (user) return true;

  redirectToSignIn(returnTo);
  return false;
}
