"use client";

const REDIRECT_KEY = "redirectAfterLogin";
const DEFAULT_REDIRECT_PATH = "/";

function normalizeRedirectPath(path: string | null | undefined): string {
  if (!path) return DEFAULT_REDIRECT_PATH;

  const trimmedPath = path.trim();
  if (!trimmedPath.startsWith("/") || trimmedPath.startsWith("//")) {
    return DEFAULT_REDIRECT_PATH;
  }

  if (/[\r\n]/.test(trimmedPath)) {
    return DEFAULT_REDIRECT_PATH;
  }

  try {
    const parsedUrl = new URL(trimmedPath, "http://localhost");
    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;

    if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//")) {
      return DEFAULT_REDIRECT_PATH;
    }

    return normalizedPath;
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }
}

export function getCurrentPathWithQuery(): string {
  if (typeof window === "undefined") return DEFAULT_REDIRECT_PATH;

  return normalizeRedirectPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
}

export function setRedirectAfterLogin(redirectPath?: string): void {
  if (typeof window === "undefined") return;

  const safePath = normalizeRedirectPath(
    redirectPath ?? getCurrentPathWithQuery(),
  );
  sessionStorage.setItem(REDIRECT_KEY, safePath);
}

export function getRedirectAfterLogin(): string {
  if (typeof window === "undefined") return DEFAULT_REDIRECT_PATH;

  return normalizeRedirectPath(sessionStorage.getItem(REDIRECT_KEY));
}

export function consumeRedirectAfterLogin(): string {
  const redirectPath = getRedirectAfterLogin();

  if (typeof window !== "undefined") {
    sessionStorage.removeItem(REDIRECT_KEY);
  }

  return redirectPath;
}

export function buildAuthCallbackURL(
  frontendUrl: string,
  redirectPath: string,
): string {
  const safePath = normalizeRedirectPath(redirectPath);

  try {
    return new URL(safePath, frontendUrl).toString();
  } catch {
    return new URL(DEFAULT_REDIRECT_PATH, frontendUrl).toString();
  }
}
