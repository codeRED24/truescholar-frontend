export type AuthorNavigationType = "user" | "college";

interface AuthorProfilePathOptions {
  authorId: string;
  type?: AuthorNavigationType;
  collegeSlug?: string;
  collegeId?: string | number;
}

export function getAuthorProfilePath({
  authorId,
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

  return `/feed/profile/${authorId}`;
}

export function getUserProfilePath(userId: string): string {
  return getAuthorProfilePath({
    authorId: userId,
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
