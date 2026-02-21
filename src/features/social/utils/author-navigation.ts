export type AuthorNavigationType = "user" | "college";

interface AuthorProfilePathOptions {
  authorId?: string;
  authorHandle?: string | null;
  type?: AuthorNavigationType;
  collegeSlug?: string;
  collegeId?: string | number;
}

export function hasUserHandle(handle?: string | null): handle is string {
  return typeof handle === "string" && handle.trim().length > 0;
}

export function getAuthorProfilePath({
  authorId,
  authorHandle,
  type = "user",
  collegeSlug,
  collegeId,
}: AuthorProfilePathOptions): string {
  if (type === "college") {
    const collegeIdentifier =
      collegeSlug ??
      (collegeId !== undefined ? String(collegeId) : authorId);
    return `/feed/colleges/${collegeIdentifier}`;
  }

  if (!hasUserHandle(authorHandle)) {
    return "";
  }

  return `/feed/profile/${encodeURIComponent(authorHandle)}`;
}

export function getUserProfilePath(userHandle: string): string {
  return getAuthorProfilePath({
    authorHandle: userHandle,
    type: "user",
  });
}

export function getCollegeProfilePath(
  slugOrId: string,
  section?: string,
): string {
  const basePath = getAuthorProfilePath({
    authorId: slugOrId,
    type: "college",
    collegeSlug: slugOrId,
  });

  if (!section) return basePath;
  return `${basePath}/${section.replace(/^\/+/, "")}`;
}
