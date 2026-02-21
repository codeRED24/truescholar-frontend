const HANDLE_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$/;

const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "signin",
  "signup",
  "profile",
  "feed",
  "settings",
  "support",
  "about",
  "help",
  "terms",
  "privacy",
]);

export function normalizeProfileHandle(handle: string): string {
  return handle.trim().toLowerCase();
}

export function validateProfileHandle(handle: string): string | null {
  const normalized = normalizeProfileHandle(handle);

  if (!HANDLE_REGEX.test(normalized)) {
    return "Use 3-30 chars with lowercase letters, numbers, _ or -";
  }

  if (RESERVED_HANDLES.has(normalized)) {
    return "This URL is reserved";
  }

  return null;
}
