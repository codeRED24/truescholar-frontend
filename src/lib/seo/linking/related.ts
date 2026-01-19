/**
 * Related Content Discovery
 * Finds and suggests related content for internal linking
 */

import { siteConfig } from "../config";

export interface RelatedItem {
  id: number;
  type: "college" | "exam" | "article";
  name: string;
  slug: string;
  href: string;
  relevanceScore: number;
  metadata?: {
    city?: string;
    state?: string;
    stream?: string;
    category?: string;
  };
}

export interface RelatedContentResult {
  sameStream: RelatedItem[];
  sameLocation: RelatedItem[];
  sameTopic: RelatedItem[];
  trending: RelatedItem[];
}

/**
 * Find related colleges based on various criteria
 */
export function findRelatedColleges(
  currentCollege: {
    college_id: number;
    city?: string;
    state?: string;
    streams?: string[];
    college_type?: string;
  },
  allColleges: Array<{
    college_id: number;
    college_name: string;
    slug: string;
    city?: string;
    state?: string;
    streams?: string[];
    college_type?: string;
    ranking?: number;
  }>,
  options: {
    maxResults?: number;
    includeSameCity?: boolean;
    includeSameState?: boolean;
    includeSameStream?: boolean;
    includeSameType?: boolean;
  } = {}
): RelatedContentResult {
  const {
    maxResults = 5,
    includeSameCity = true,
    includeSameState = true,
    includeSameStream = true,
    includeSameType = true,
  } = options;

  const otherColleges = allColleges.filter(
    (c) => c.college_id !== currentCollege.college_id
  );

  const result: RelatedContentResult = {
    sameStream: [],
    sameLocation: [],
    sameTopic: [], // Same type for colleges
    trending: [],
  };

  // Find same stream colleges
  if (includeSameStream && currentCollege.streams?.length) {
    result.sameStream = otherColleges
      .filter((c) =>
        c.streams?.some((s) => currentCollege.streams!.includes(s))
      )
      .map((c) => ({
        id: c.college_id,
        type: "college" as const,
        name: c.college_name,
        slug: `${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        href: `/colleges/${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        relevanceScore: calculateRelevanceScore(currentCollege, c),
        metadata: { city: c.city, state: c.state },
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  // Find same location colleges
  if (includeSameCity && currentCollege.city) {
    result.sameLocation = otherColleges
      .filter((c) => c.city === currentCollege.city)
      .map((c) => ({
        id: c.college_id,
        type: "college" as const,
        name: c.college_name,
        slug: `${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        href: `/colleges/${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        relevanceScore: calculateRelevanceScore(currentCollege, c),
        metadata: { city: c.city, state: c.state },
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  } else if (includeSameState && currentCollege.state) {
    result.sameLocation = otherColleges
      .filter((c) => c.state === currentCollege.state)
      .map((c) => ({
        id: c.college_id,
        type: "college" as const,
        name: c.college_name,
        slug: `${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        href: `/colleges/${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        relevanceScore: calculateRelevanceScore(currentCollege, c),
        metadata: { city: c.city, state: c.state },
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  // Find same type colleges
  if (includeSameType && currentCollege.college_type) {
    result.sameTopic = otherColleges
      .filter((c) => c.college_type === currentCollege.college_type)
      .map((c) => ({
        id: c.college_id,
        type: "college" as const,
        name: c.college_name,
        slug: `${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        href: `/colleges/${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
        relevanceScore: calculateRelevanceScore(currentCollege, c),
        metadata: { city: c.city, state: c.state },
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  // Top ranked colleges as trending
  result.trending = otherColleges
    .filter((c) => c.ranking && c.ranking <= 50)
    .map((c) => ({
      id: c.college_id,
      type: "college" as const,
      name: c.college_name,
      slug: `${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
      href: `/colleges/${c.slug.replace(/(?:-\d+)+$/, "")}-${c.college_id}`,
      relevanceScore: 100 - (c.ranking || 100),
      metadata: { city: c.city, state: c.state },
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);

  return result;
}

/**
 * Find related exams based on criteria
 */
export function findRelatedExams(
  currentExam: {
    exam_id: number;
    streams?: string[];
    exam_level?: string;
    conducting_body?: string;
  },
  allExams: Array<{
    exam_id: number;
    exam_name: string;
    slug: string;
    streams?: string[];
    exam_level?: string;
    conducting_body?: string;
  }>,
  maxResults = 5
): RelatedItem[] {
  return allExams
    .filter((e) => e.exam_id !== currentExam.exam_id)
    .map((exam) => {
      let score = 0;

      // Same stream
      if (currentExam.streams && exam.streams) {
        const overlap = currentExam.streams.filter((s) =>
          exam.streams!.includes(s)
        ).length;
        score += overlap * 3;
      }

      // Same level (national, state, university)
      if (currentExam.exam_level && exam.exam_level === currentExam.exam_level) {
        score += 2;
      }

      // Same conducting body
      if (
        currentExam.conducting_body &&
        exam.conducting_body === currentExam.conducting_body
      ) {
        score += 2;
      }

      return {
        id: exam.exam_id,
        type: "exam" as const,
        name: exam.exam_name,
        slug: `${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`,
        href: `/exams/${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`,
        relevanceScore: score,
        metadata: { stream: exam.streams?.[0] },
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Find related articles based on category and tags
 */
export function findRelatedArticles(
  currentArticle: {
    article_id: number;
    category?: string;
    tags?: string[];
  },
  allArticles: Array<{
    article_id: number;
    title: string;
    slug: string;
    category?: string;
    tags?: string[];
  }>,
  maxResults = 5
): RelatedItem[] {
  return allArticles
    .filter((a) => a.article_id !== currentArticle.article_id)
    .map((article) => {
      let score = 0;

      // Same category
      if (currentArticle.category && article.category === currentArticle.category) {
        score += 5;
      }

      // Overlapping tags
      if (currentArticle.tags && article.tags) {
        const overlap = currentArticle.tags.filter((t) =>
          article.tags!.includes(t)
        ).length;
        score += overlap * 2;
      }

      return {
        id: article.article_id,
        type: "article" as const,
        name: article.title,
        slug: `${article.slug.replace(/\s+/g, "-").toLowerCase()}-${article.article_id}`,
        href: `/articles/${article.slug.replace(/\s+/g, "-").toLowerCase()}-${article.article_id}`,
        relevanceScore: score,
        metadata: { category: article.category },
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Calculate relevance score between two colleges
 */
function calculateRelevanceScore(
  college1: {
    city?: string;
    state?: string;
    streams?: string[];
    college_type?: string;
  },
  college2: {
    city?: string;
    state?: string;
    streams?: string[];
    college_type?: string;
    ranking?: number;
  }
): number {
  let score = 0;

  // Same city = high relevance
  if (college1.city && college2.city && college1.city === college2.city) {
    score += 4;
  }

  // Same state = medium relevance
  if (college1.state && college2.state && college1.state === college2.state) {
    score += 2;
  }

  // Stream overlap
  if (college1.streams && college2.streams) {
    const overlap = college1.streams.filter((s) =>
      college2.streams!.includes(s)
    ).length;
    score += overlap * 3;
  }

  // Same type
  if (
    college1.college_type &&
    college2.college_type &&
    college1.college_type === college2.college_type
  ) {
    score += 2;
  }

  // Ranking bonus
  if (college2.ranking && college2.ranking <= 100) {
    score += Math.max(0, (100 - college2.ranking) / 20);
  }

  return score;
}

/**
 * Get cross-entity links (e.g., exams accepting colleges from this stream)
 */
export function getCrossEntityLinks(
  entityType: "college" | "exam",
  streams?: string[]
): Array<{ label: string; href: string; type: string }> {
  if (!streams || streams.length === 0) return [];

  const links: Array<{ label: string; href: string; type: string }> = [];

  streams.slice(0, 3).forEach((stream) => {
    const streamSlug = stream.toLowerCase().replace(/\s+/g, "-");

    if (entityType === "college") {
      // Link to related exams
      links.push({
        label: `${stream} Entrance Exams`,
        href: `/exams-stream-${streamSlug}`,
        type: "exam",
      });
    } else {
      // Link to related colleges
      links.push({
        label: `${stream} Colleges`,
        href: `/colleges-stream-${streamSlug}`,
        type: "college",
      });
    }
  });

  return links;
}
