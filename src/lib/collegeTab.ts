// Utility functions to map college tab slugs and build redirect URLs

/**
 * Maps raw slug values from the database to the corresponding frontend tab path.
 * @param slug Raw slug value from DB (e.g., "admission", "highlights").
 * @returns Path segment for the tab (e.g., "", "/highlights").
 */
export function mapCollegeTabSlugToPath(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  switch (normalized) {
    case "admission":
    case "admissions":
      return "/admission-process";

    case "courses":
    case "course":
      return "/courses";

    case "cutoff":
    case "cutoffs":
      return "/cutoffs";

    case "eligibility":
    case "eligibilities":
      return "/eligibility";

    case "facility":
    case "facilities":
      return "/facilities";

    case "faq":
    case "faqs":
      return "/faq";

    case "fees":
    case "fee":
      return "/fees";

    case "highlights":
    case "highlight":
      return "/highlights";

    case "info":
      return "";

    case "news":
      return "/news";

    case "other":
    case "others":
      return "/others";

    case "placement":
    case "placements":
      return "/placements";

    case "ranking":
    case "rankings":
      return "/rankings";

    case "result":
    case "results":
      return "/results";

    case "scholarship":
    case "scholarships":
      return "/scholarship";

    default:
      // default to Info tab
      return "";
  }
}

/**
 * Build a full college tab URL based on base path and DB slug.
 * @param basePath Base path for the college (e.g., "/colleges/company-123").
 * @param slug Raw slug value from DB.
 * @returns Full URL to redirect to the correct tab.
 */
export function getCollegeTabUrl(basePath: string, slug: string): string {
  const segment = mapCollegeTabSlugToPath(slug);
  return `${basePath}${segment}`;
}
