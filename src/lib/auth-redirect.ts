const REDIRECT_KEY = "redirectAfterLogin";
const SIGNIN_PATH = "/signin";
const REDIRECT_QUERY_KEYS = ["redirect", "redirectAfterLogin"] as const;

function getCurrentPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function normalizeRedirectTarget(input?: string | null): string | null {
  if (!input) return null;

  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return null;

  if (typeof window === "undefined") {
    if (!trimmed.startsWith("/")) return null;
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;

    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!normalized.startsWith("/")) return null;
    if (normalized.startsWith(SIGNIN_PATH)) return "/";

    return normalized;
  } catch {
    return null;
  }
}

export function saveRedirectTarget(path: string): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeRedirectTarget(path);
  if (!normalized) return;

  sessionStorage.setItem(REDIRECT_KEY, normalized);
}

export function getRedirectTarget(defaultPath = "/"): string {
  if (typeof window === "undefined") return defaultPath;

  const query = new URLSearchParams(window.location.search);
  for (const key of REDIRECT_QUERY_KEYS) {
    const fromQuery = normalizeRedirectTarget(query.get(key));
    if (fromQuery) {
      sessionStorage.setItem(REDIRECT_KEY, fromQuery);
      return fromQuery;
    }
  }

  const normalized = normalizeRedirectTarget(sessionStorage.getItem(REDIRECT_KEY));
  return normalized ?? defaultPath;
}

export function consumeRedirectTarget(defaultPath = "/"): string {
  if (typeof window === "undefined") return defaultPath;

  const target = getRedirectTarget(defaultPath);
  sessionStorage.removeItem(REDIRECT_KEY);
  return target;
}

export function redirectToSigninWithReturn(path?: string): void {
  if (typeof window === "undefined") return;

  const fallbackPath = path ?? getCurrentPath();
  const normalized = normalizeRedirectTarget(fallbackPath) ?? "/";
  saveRedirectTarget(normalized);

  const signinUrl = new URL(SIGNIN_PATH, window.location.origin);
  signinUrl.searchParams.set("redirect", normalized);

  const target = `${signinUrl.pathname}${signinUrl.search}`;
  if (window.location.pathname === SIGNIN_PATH) {
    return;
  }

  window.location.assign(target);
}
