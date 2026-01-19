/**
 * Keyword Cannibalization Detector
 * Identifies and prevents pages competing for the same keywords
 */

export interface PageKeywordData {
  url: string;
  title: string;
  keywords: string[];
  entityType: string;
  entityId?: number;
}

export interface CannibalizationReport {
  conflicts: CannibalizationConflict[];
  recommendations: string[];
  overallScore: number; // 0-100, higher is better (less cannibalization)
}

export interface CannibalizationConflict {
  keyword: string;
  competingPages: Array<{
    url: string;
    title: string;
    relevanceScore: number;
  }>;
  severity: "high" | "medium" | "low";
  recommendation: string;
}

/**
 * Detect keyword cannibalization across a set of pages
 */
export function detectKeywordCannibalization(
  pages: PageKeywordData[]
): CannibalizationReport {
  const keywordToPages = new Map<string, PageKeywordData[]>();

  // Build keyword -> pages mapping
  for (const page of pages) {
    for (const keyword of page.keywords) {
      const normalizedKeyword = normalizeKeyword(keyword);
      
      if (!keywordToPages.has(normalizedKeyword)) {
        keywordToPages.set(normalizedKeyword, []);
      }
      keywordToPages.get(normalizedKeyword)!.push(page);
    }
  }

  // Find conflicts (keywords with multiple pages)
  const conflicts: CannibalizationConflict[] = [];

  for (const [keyword, competingPages] of keywordToPages.entries()) {
    if (competingPages.length > 1) {
      const severity = getSeverity(competingPages.length, keyword);
      
      conflicts.push({
        keyword,
        competingPages: competingPages.map((p) => ({
          url: p.url,
          title: p.title,
          relevanceScore: calculateKeywordRelevance(keyword, p),
        })),
        severity,
        recommendation: generateRecommendation(keyword, competingPages),
      });
    }
  }

  // Sort by severity
  conflicts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Calculate overall score
  const totalKeywords = keywordToPages.size;
  const conflictingKeywords = conflicts.length;
  const overallScore = totalKeywords > 0
    ? Math.round(((totalKeywords - conflictingKeywords) / totalKeywords) * 100)
    : 100;

  // Generate recommendations
  const recommendations = generateOverallRecommendations(conflicts);

  return {
    conflicts,
    recommendations,
    overallScore,
  };
}

/**
 * Normalize keyword for comparison
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

/**
 * Calculate keyword relevance for a page
 */
function calculateKeywordRelevance(
  keyword: string,
  page: PageKeywordData
): number {
  let score = 50; // Base score

  // Keyword in title
  if (page.title.toLowerCase().includes(keyword.toLowerCase())) {
    score += 30;
  }

  // Keyword position in keywords list (earlier = more relevant)
  const position = page.keywords.findIndex(
    (k) => normalizeKeyword(k) === normalizeKeyword(keyword)
  );
  if (position === 0) {
    score += 20;
  } else if (position <= 2) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Determine severity of cannibalization
 */
function getSeverity(pageCount: number, keyword: string): "high" | "medium" | "low" {
  // More pages = higher severity
  if (pageCount >= 4) return "high";
  if (pageCount >= 3) return "medium";

  // High-value keywords are more severe
  const highValuePatterns = [
    /\bcollege\b/i,
    /\buniversity\b/i,
    /\badmission\b/i,
    /\bexam\b/i,
    /\bcutoff\b/i,
    /\bfees\b/i,
    /\bplacements\b/i,
  ];

  if (highValuePatterns.some((p) => p.test(keyword))) {
    return pageCount >= 2 ? "medium" : "low";
  }

  return "low";
}

/**
 * Generate recommendation for a conflict
 */
function generateRecommendation(
  keyword: string,
  pages: PageKeywordData[]
): string {
  // Sort by relevance to find the "winner"
  const sorted = pages.sort(
    (a, b) =>
      calculateKeywordRelevance(keyword, b) -
      calculateKeywordRelevance(keyword, a)
  );

  const winner = sorted[0];
  const losers = sorted.slice(1);

  if (losers.length === 1) {
    return `Keep "${keyword}" on ${winner.url}, remove or modify on ${losers[0].url}`;
  }

  return `Keep "${keyword}" on ${winner.url}, consider using different keywords on ${losers.length} other pages`;
}

/**
 * Generate overall recommendations
 */
function generateOverallRecommendations(
  conflicts: CannibalizationConflict[]
): string[] {
  const recommendations: string[] = [];

  const highSeverity = conflicts.filter((c) => c.severity === "high");
  const mediumSeverity = conflicts.filter((c) => c.severity === "medium");

  if (highSeverity.length > 0) {
    recommendations.push(
      `Address ${highSeverity.length} high-severity keyword conflicts immediately`
    );
  }

  if (mediumSeverity.length > 0) {
    recommendations.push(
      `Review ${mediumSeverity.length} medium-severity conflicts for optimization`
    );
  }

  // Pattern-specific recommendations
  const collegeConflicts = conflicts.filter((c) =>
    c.keyword.includes("college")
  );
  if (collegeConflicts.length > 3) {
    recommendations.push(
      "Consider creating more specific college landing pages (by city, stream, course) to reduce generic keyword competition"
    );
  }

  const examConflicts = conflicts.filter((c) => c.keyword.includes("exam"));
  if (examConflicts.length > 3) {
    recommendations.push(
      "Differentiate exam pages by focusing on specific aspects (syllabus, dates, results) in titles and keywords"
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("No significant keyword cannibalization detected");
  }

  return recommendations;
}

/**
 * Suggest alternative keywords to avoid cannibalization
 */
export function suggestAlternativeKeywords(
  conflictingKeyword: string,
  entityType: string,
  entityData: {
    name?: string;
    city?: string;
    state?: string;
    stream?: string;
    year?: number;
  }
): string[] {
  const alternatives: string[] = [];
  const year = entityData.year || new Date().getFullYear();

  // Add location-specific variants
  if (entityData.city) {
    alternatives.push(`${conflictingKeyword} ${entityData.city}`);
    alternatives.push(`${conflictingKeyword} in ${entityData.city}`);
  }

  if (entityData.state && !entityData.city) {
    alternatives.push(`${conflictingKeyword} ${entityData.state}`);
  }

  // Add year variants
  alternatives.push(`${conflictingKeyword} ${year}`);

  // Add stream variants
  if (entityData.stream) {
    alternatives.push(`${entityData.stream} ${conflictingKeyword}`);
  }

  // Add name-specific variants
  if (entityData.name) {
    alternatives.push(`${entityData.name} ${conflictingKeyword}`);
  }

  return alternatives.slice(0, 5);
}
