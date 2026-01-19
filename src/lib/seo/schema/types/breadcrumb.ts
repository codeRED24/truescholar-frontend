/**
 * Breadcrumb Schema Builder
 * Generates BreadcrumbList structured data
 */

import { siteConfig } from "../../config";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Build BreadcrumbList schema from breadcrumb items
 */
export function buildBreadcrumbSchema(
  breadcrumbs: BreadcrumbItem[],
): BreadcrumbSchema {
  const baseUrl = siteConfig.baseUrl;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Common breadcrumb configurations
 */
export const commonBreadcrumbs = {
  home: (): BreadcrumbItem => ({ name: "Home", url: "/" }),

  colleges: (): BreadcrumbItem => ({ name: "Colleges", url: "/colleges" }),

  exams: (): BreadcrumbItem => ({ name: "Exams", url: "/exams" }),

  articles: (): BreadcrumbItem => ({ name: "Articles", url: "/articles" }),

  authors: (): BreadcrumbItem => ({ name: "Authors", url: "/authors" }),

  college: (name: string, slug: string): BreadcrumbItem => ({
    name,
    url: `/colleges/${slug}`,
  }),

  collegeTab: (
    collegeName: string,
    collegeSlug: string,
    tabName: string,
    tabPath: string,
  ): BreadcrumbItem[] => [
    commonBreadcrumbs.home(),
    commonBreadcrumbs.colleges(),
    commonBreadcrumbs.college(collegeName, collegeSlug),
    { name: tabName, url: `/colleges/${collegeSlug}${tabPath}` },
  ],

  exam: (name: string, slug: string): BreadcrumbItem => ({
    name,
    url: `/exams/${slug}`,
  }),

  examSilo: (
    examName: string,
    examSlug: string,
    siloName: string,
    siloPath: string,
  ): BreadcrumbItem[] => [
    commonBreadcrumbs.home(),
    commonBreadcrumbs.exams(),
    commonBreadcrumbs.exam(examName, examSlug),
    { name: siloName, url: `/exams/${examSlug}${siloPath}` },
  ],

  article: (title: string, slug: string): BreadcrumbItem => ({
    name: title,
    url: `/articles/${slug}`,
  }),

  author: (name: string, slug: string): BreadcrumbItem => ({
    name,
    url: `/authors/${slug}`,
  }),
};

/**
 * Build full breadcrumb chain for college pages
 */
export function buildCollegeBreadcrumbs(
  collegeName: string,
  collegeSlug: string,
  tabName?: string,
  tabPath?: string,
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    commonBreadcrumbs.home(),
    commonBreadcrumbs.colleges(),
    commonBreadcrumbs.college(collegeName, collegeSlug),
  ];

  if (tabName && tabPath) {
    crumbs.push({
      name: tabName,
      url: `/colleges/${collegeSlug}${tabPath}`,
    });
  }

  return crumbs;
}

/**
 * Build full breadcrumb chain for exam pages
 */
export function buildExamBreadcrumbs(
  examName: string,
  examSlug: string,
  siloName?: string,
  siloPath?: string,
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    commonBreadcrumbs.home(),
    commonBreadcrumbs.exams(),
    commonBreadcrumbs.exam(examName, examSlug),
  ];

  if (siloName && siloPath) {
    crumbs.push({
      name: siloName,
      url: `/exams/${examSlug}${siloPath}`,
    });
  }

  return crumbs;
}

/**
 * Build full breadcrumb chain for article pages
 */
export function buildArticleBreadcrumbs(
  articleTitle: string,
  articleSlug: string,
  category?: string,
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ];

  crumbs.push(commonBreadcrumbs.article(articleTitle, articleSlug));

  return crumbs;
}

/**
 * Build breadcrumbs for filter pages
 */
export function buildFilterBreadcrumbs(
  entityType: "colleges" | "exams",
  stream?: string,
  city?: string,
  state?: string,
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [commonBreadcrumbs.home()];

  if (entityType === "colleges") {
    crumbs.push(commonBreadcrumbs.colleges());

    if (stream) {
      crumbs.push({
        name: `${stream} Colleges`,
        url: `/colleges-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`,
      });
    }

    if (city) {
      const citySlug = city.toLowerCase().replace(/\s+/g, "-");
      crumbs.push({
        name: `Colleges in ${city}`,
        url: stream
          ? `/colleges-city-${citySlug}-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`
          : `/colleges-city-${citySlug}`,
      });
    } else if (state) {
      const stateSlug = state.toLowerCase().replace(/\s+/g, "-");
      crumbs.push({
        name: `Colleges in ${state}`,
        url: stream
          ? `/colleges-state-${stateSlug}-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`
          : `/colleges-state-${stateSlug}`,
      });
    }
  } else {
    crumbs.push(commonBreadcrumbs.exams());

    if (stream) {
      crumbs.push({
        name: `${stream} Exams`,
        url: `/exams-stream-${stream.toLowerCase().replace(/\s+/g, "-")}`,
      });
    }
  }

  return crumbs;
}
