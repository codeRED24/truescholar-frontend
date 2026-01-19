/**
 * Hub-and-Spoke Internal Linking System
 * Generates structured internal links for SEO optimization
 */

import { siteConfig, collegeTabConfig, examSiloConfig } from "../config";

export interface HubLink {
  label: string;
  href: string;
  priority: number;
  description?: string;
}

export interface SpokeLink {
  label: string;
  href: string;
  available: boolean;
  priority: number;
}

export interface EntityLink {
  id: number;
  name: string;
  slug: string;
  href: string;
  location?: string;
  rating?: number;
}

export interface HubSpokeLinks {
  // Link back to the hub page
  hubPage: HubLink;
  // Links to sibling pages (same level)
  siblingPages: SpokeLink[];
  // Links to child pages (sub-tabs/silos)
  childPages: SpokeLink[];
  // Related entities (same category)
  relatedEntities: EntityLink[];
  // Cross-category links
  crossLinks: HubLink[];
}

/**
 * Generate hub-and-spoke links for a college page
 */
export function getCollegeHubSpokeLinks(
  collegeData: {
    college_id: number;
    college_name: string;
    slug: string;
    city?: string;
    state?: string;
    streams?: string[];
    available_tabs?: string[];
  },
  currentTab: string = "info",
  relatedColleges?: Array<{
    college_id: number;
    college_name: string;
    slug: string;
    city?: string;
  }>
): HubSpokeLinks {
  const collegeSlug = `${collegeData.slug.replace(/(?:-\d+)+$/, "")}-${collegeData.college_id}`;
  const basePath = `/colleges/${collegeSlug}`;

  // Hub page (colleges listing)
  const hubPage: HubLink = {
    label: "All Colleges",
    href: "/colleges",
    priority: 0.9,
    description: "Browse all colleges in India",
  };

  // Child pages (college tabs)
  const availableTabs = collegeData.available_tabs || Object.keys(collegeTabConfig);
  const childPages: SpokeLink[] = Object.entries(collegeTabConfig)
    .filter(([key]) => key !== currentTab)
    .map(([key, config]) => ({
      label: config.label,
      href: `${basePath}${config.path}`,
      available: availableTabs.includes(key),
      priority: config.priority,
    }))
    .sort((a, b) => b.priority - a.priority);

  // Related entities (similar colleges)
  const relatedEntities: EntityLink[] = (relatedColleges || []).map((college) => ({
    id: college.college_id,
    name: college.college_name,
    slug: `${college.slug.replace(/(?:-\d+)+$/, "")}-${college.college_id}`,
    href: `/colleges/${college.slug.replace(/(?:-\d+)+$/, "")}-${college.college_id}`,
    location: college.city,
  }));

  // Cross-category links
  const crossLinks: HubLink[] = [];

  // Link to stream-specific pages if college has streams
  if (collegeData.streams && collegeData.streams.length > 0) {
    collegeData.streams.slice(0, 2).forEach((stream) => {
      crossLinks.push({
        label: `${stream} Colleges`,
        href: `/colleges-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`,
        priority: 0.7,
      });
    });
  }

  // Link to city-specific pages
  if (collegeData.city) {
    crossLinks.push({
      label: `Colleges in ${collegeData.city}`,
      href: `/colleges-city-${collegeData.city.toLowerCase().replace(/\s+/g, "-")}`,
      priority: 0.7,
    });
  }

  // Link to state-specific pages
  if (collegeData.state) {
    crossLinks.push({
      label: `Colleges in ${collegeData.state}`,
      href: `/colleges-state-${collegeData.state.toLowerCase().replace(/\s+/g, "-")}`,
      priority: 0.6,
    });
  }

  return {
    hubPage,
    siblingPages: [], // Sibling colleges are in relatedEntities
    childPages: childPages.filter((p) => p.available),
    relatedEntities,
    crossLinks,
  };
}

/**
 * Generate hub-and-spoke links for an exam page
 */
export function getExamHubSpokeLinks(
  examData: {
    exam_id: number;
    exam_name: string;
    slug: string;
    streams?: string[];
    available_silos?: string[];
  },
  currentSilo: string = "info",
  relatedExams?: Array<{
    exam_id: number;
    exam_name: string;
    slug: string;
  }>
): HubSpokeLinks {
  const examSlug = `${examData.slug.replace(/-\d+$/, "")}-${examData.exam_id}`;
  const basePath = `/exams/${examSlug}`;

  // Hub page
  const hubPage: HubLink = {
    label: "All Exams",
    href: "/exams",
    priority: 0.9,
    description: "Browse all entrance exams in India",
  };

  // Child pages (exam silos)
  const availableSilos = examData.available_silos || Object.keys(examSiloConfig);
  const childPages: SpokeLink[] = Object.entries(examSiloConfig)
    .filter(([key]) => key !== currentSilo && key !== "info")
    .map(([key, config]) => ({
      label: config.label,
      href: `${basePath}${config.path}`,
      available: availableSilos.includes(key),
      priority: config.priority,
    }))
    .sort((a, b) => b.priority - a.priority);

  // Related entities
  const relatedEntities: EntityLink[] = (relatedExams || []).map((exam) => ({
    id: exam.exam_id,
    name: exam.exam_name,
    slug: `${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`,
    href: `/exams/${exam.slug.replace(/-\d+$/, "")}-${exam.exam_id}`,
  }));

  // Cross-category links
  const crossLinks: HubLink[] = [];

  if (examData.streams && examData.streams.length > 0) {
    examData.streams.slice(0, 2).forEach((stream) => {
      crossLinks.push({
        label: `${stream} Exams`,
        href: `/exams-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`,
        priority: 0.7,
      });

      // Link to colleges accepting this stream
      crossLinks.push({
        label: `${stream} Colleges`,
        href: `/colleges-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`,
        priority: 0.6,
      });
    });
  }

  return {
    hubPage,
    siblingPages: [],
    childPages: childPages.filter((p) => p.available),
    relatedEntities,
    crossLinks,
  };
}

/**
 * Generate contextual internal links based on content
 */
export function generateContextualLinks(
  content: string,
  availableLinks: Array<{
    pattern: RegExp;
    href: string;
    label: string;
  }>
): Array<{ text: string; href: string; label: string }> {
  const matches: Array<{ text: string; href: string; label: string }> = [];

  for (const link of availableLinks) {
    const match = content.match(link.pattern);
    if (match) {
      matches.push({
        text: match[0],
        href: link.href,
        label: link.label,
      });
    }
  }

  return matches;
}

/**
 * Get "You may also like" suggestions
 */
export function getRelatedSuggestions(
  entityType: "college" | "exam" | "article",
  currentEntity: { id: number; streams?: string[]; city?: string },
  allEntities: Array<{
    id: number;
    name: string;
    slug: string;
    streams?: string[];
    city?: string;
  }>,
  limit = 6
): EntityLink[] {
  // Score entities by similarity
  const scored = allEntities
    .filter((e) => e.id !== currentEntity.id)
    .map((entity) => {
      let score = 0;

      // Same city = higher score
      if (currentEntity.city && entity.city === currentEntity.city) {
        score += 3;
      }

      // Overlapping streams = score per overlap
      if (currentEntity.streams && entity.streams) {
        const overlap = currentEntity.streams.filter((s) =>
          entity.streams!.includes(s)
        ).length;
        score += overlap * 2;
      }

      return { entity, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ entity }) => ({
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    href: `/${entityType === "college" ? "colleges" : entityType === "exam" ? "exams" : "articles"}/${entity.slug}`,
    location: entity.city,
  }));
}
