/**
 * Canonical URL Strategy
 * Prevents keyword cannibalization for filter and variant pages
 */

import { siteConfig } from "../config";

export interface FilterParams {
  entityType: "college" | "exam";
  stream?: { id: number; name: string; slug: string };
  city?: { id: number; name: string; slug: string };
  state?: { id: number; name: string; slug: string };
  course?: { id: number; name: string; slug: string };
}

export interface CanonicalResult {
  canonicalUrl: string;
  shouldIndex: boolean;
  robotsDirective: "index, follow" | "noindex, follow" | "noindex, nofollow";
  reason?: string;
}

/**
 * Determine canonical URL and indexability for filter pages
 * 
 * Strategy:
 * 1. Most specific filter combination is canonical
 * 2. Broader pages should point to narrower ones
 * 3. Empty or near-empty filter results are noindexed
 * 4. Overlapping filters are consolidated
 */
export function getFilterCanonicalStrategy(
  params: FilterParams,
  resultCount: number
): CanonicalResult {
  const baseUrl = siteConfig.baseUrl;

  // No results = definitely noindex
  if (resultCount === 0) {
    return {
      canonicalUrl: buildFilterUrl(params),
      shouldIndex: false,
      robotsDirective: "noindex, follow",
      reason: "No results for this filter combination",
    };
  }

  // Very few results = noindex to avoid thin content
  if (resultCount < 3) {
    return {
      canonicalUrl: buildFilterUrl(params),
      shouldIndex: false,
      robotsDirective: "noindex, follow",
      reason: `Only ${resultCount} results - thin content`,
    };
  }

  // Build the canonical URL for this filter combination
  const canonicalPath = buildCanonicalFilterPath(params);
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  // Determine if this is the most specific combination
  const specificity = calculateFilterSpecificity(params);

  // Index if we have reasonable results and good specificity
  const shouldIndex = resultCount >= 3 && specificity.isCanonical;

  return {
    canonicalUrl,
    shouldIndex,
    robotsDirective: shouldIndex ? "index, follow" : "noindex, follow",
    reason: shouldIndex 
      ? undefined 
      : "More specific filter combination exists",
  };
}

/**
 * Build filter URL from parameters
 */
export function buildFilterUrl(params: FilterParams): string {
  const baseUrl = siteConfig.baseUrl;
  return `${baseUrl}${buildCanonicalFilterPath(params)}`;
}

/**
 * Build canonical filter path
 * Uses a consistent ordering: entity-city-state-stream-course
 */
function buildCanonicalFilterPath(params: FilterParams): string {
  const parts: string[] = [params.entityType === "college" ? "colleges" : "exams"];

  // Order: stream, then location (city preferred over state)
  if (params.stream) {
    parts.push(`stream-${params.stream.slug}`);
  }

  if (params.city) {
    parts.push(`city-${params.city.slug}`);
  } else if (params.state) {
    parts.push(`state-${params.state.slug}`);
  }

  if (params.course) {
    parts.push(`course-${params.course.slug}`);
  }

  return `/${parts.join("-")}`;
}

/**
 * Calculate filter specificity
 */
function calculateFilterSpecificity(params: FilterParams): {
  level: number;
  isCanonical: boolean;
} {
  let level = 0;

  if (params.stream) level++;
  if (params.city) level += 2; // City is more specific than state
  if (params.state && !params.city) level++;
  if (params.course) level++;

  // Most specific combinations are canonical
  // Less specific should defer to more specific
  return {
    level,
    isCanonical: level >= 1, // At least one filter applied
  };
}

/**
 * Get the more specific canonical for a filter combination
 */
export function findMoreSpecificCanonical(
  params: FilterParams,
  availableFilters: {
    streams: Array<{ id: number; slug: string; count: number }>;
    cities: Array<{ id: number; slug: string; count: number }>;
    states: Array<{ id: number; slug: string; count: number }>;
  }
): string | null {
  // If we don't have stream but have available streams, suggest adding stream
  if (!params.stream && availableFilters.streams.length === 1) {
    const stream = availableFilters.streams[0];
    return buildCanonicalFilterPath({
      ...params,
      stream: { id: stream.id, name: stream.slug, slug: stream.slug },
    });
  }

  // If we have state but not city, and only one city is available
  if (params.state && !params.city && availableFilters.cities.length === 1) {
    const city = availableFilters.cities[0];
    return buildCanonicalFilterPath({
      ...params,
      city: { id: city.id, name: city.slug, slug: city.slug },
      state: undefined, // City supersedes state
    });
  }

  return null;
}

/**
 * Detect potential keyword cannibalization
 */
export function detectCannibalization(
  page1: { url: string; keywords: string[] },
  page2: { url: string; keywords: string[] }
): {
  hasCannibalization: boolean;
  overlappingKeywords: string[];
  recommendation: string;
} {
  const keywords1 = new Set(page1.keywords.map((k) => k.toLowerCase()));
  const keywords2 = new Set(page2.keywords.map((k) => k.toLowerCase()));

  const overlapping = [...keywords1].filter((k) => keywords2.has(k));
  const overlapRatio = overlapping.length / Math.min(keywords1.size, keywords2.size);

  if (overlapRatio > 0.5) {
    return {
      hasCannibalization: true,
      overlappingKeywords: overlapping,
      recommendation: `Consider consolidating ${page1.url} and ${page2.url} or differentiating their target keywords`,
    };
  }

  return {
    hasCannibalization: false,
    overlappingKeywords: overlapping,
    recommendation: "No significant keyword overlap detected",
  };
}

/**
 * Generate unique keywords for filter page to avoid cannibalization
 */
export function generateUniqueFilterKeywords(params: FilterParams): string[] {
  const keywords: string[] = [];
  const entityLabel = params.entityType === "college" ? "colleges" : "exams";

  // Build specific keyword combinations
  if (params.stream && params.city) {
    keywords.push(
      `${params.stream.name} ${entityLabel} in ${params.city.name}`,
      `best ${params.stream.name.toLowerCase()} ${entityLabel} ${params.city.name}`,
      `top ${params.stream.name.toLowerCase()} ${entityLabel} in ${params.city.name}`
    );
  } else if (params.stream && params.state) {
    keywords.push(
      `${params.stream.name} ${entityLabel} in ${params.state.name}`,
      `${params.state.name} ${params.stream.name.toLowerCase()} ${entityLabel}`
    );
  } else if (params.stream) {
    keywords.push(
      `${params.stream.name} ${entityLabel}`,
      `best ${params.stream.name.toLowerCase()} ${entityLabel} in India`,
      `top ${params.stream.name.toLowerCase()} ${entityLabel}`
    );
  } else if (params.city) {
    keywords.push(
      `${entityLabel} in ${params.city.name}`,
      `best ${entityLabel} in ${params.city.name}`,
      `top ${entityLabel} ${params.city.name}`
    );
  } else if (params.state) {
    keywords.push(
      `${entityLabel} in ${params.state.name}`,
      `${params.state.name} ${entityLabel}`
    );
  }

  return keywords.slice(0, 10);
}
