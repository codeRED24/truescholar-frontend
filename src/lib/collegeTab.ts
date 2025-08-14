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
      return "/admission-process";
    case "courses":
      return "/courses";
    case "cutoff":
      return "/cutoffs";

    case "eligibility":
      return "/eligibility";
    case "facility":
      return "/facilities";
    case "faq":
      return "/faq";

    case "fees":
      return "/fees";
    case "highlight":
      return "/highlights";
    case "info":
      return "";

    case "news":
      return "/news";
    case "other":
      return "/others";
    case "placement":
      return "/placements";

    case "ranking":
      return "/rankings";
    case "result":
      return "/results";
    case "scholarship":
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
