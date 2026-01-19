/**
 * URL Builder Utilities
 * Centralized logic for generating canonical URLs for entities.
 * Ensures consistency between Sitemap, UI links, and Page redirects.
 */

/**
 * Clean a slug by removing trailing ID patterns.
 * Matches one or more groups of hyphen-digits at the end of the string.
 * Example: "college-name-123-456" -> "college-name"
 */
export function cleanSlug(slug?: string | null): string {
  if (!slug) return "";
  return slug.replace(/(?:-\d+)+$/, "");
}

/**
 * Build a canonical URL for a college
 */
export function buildCollegeUrl(
  slug: string | undefined | null,
  id: number | string
): string {
  const clean = cleanSlug(slug) || "college";
  return `/colleges/${clean}-${id}`;
}

/**
 * Build a canonical URL for an exam
 */
export function buildExamUrl(
  slug: string | undefined | null,
  id: number | string
): string {
  // Exams sometimes have spaces in raw slugs from DB, so we normalize
  const normalized = (slug || "exam").replace(/\s+/g, "-").toLowerCase();
  const clean = cleanSlug(normalized);
  return `/exams/${clean}-${id}`;
}

/**
 * Build a canonical URL for an article
 */
export function buildArticleUrl(
  slug: string | undefined | null,
  id: number | string
): string {
  const normalized = (slug || "article").replace(/\s+/g, "-").toLowerCase();
  // Articles don't typically have IDs in the DB slug, but we clean just in case
  const clean = cleanSlug(normalized);
  return `/articles/${clean}-${id}`;
}
