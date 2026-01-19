/**
 * Enhanced Breadcrumbs System
 * Provides visual breadcrumbs with integrated schema markup
 */

import { siteConfig, collegeTabConfig, examSiloConfig } from "../config";

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

/**
 * Build breadcrumb trail for college pages
 */
export function buildCollegeBreadcrumbTrail(
  collegeName: string,
  collegeSlug: string,
  tab?: keyof typeof collegeTabConfig
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Colleges", href: "/colleges" },
    {
      name: collegeName,
      href: `/colleges/${collegeSlug}`,
      current: !tab || tab === "info",
    },
  ];

  if (tab && tab !== "info") {
    const tabConfig = collegeTabConfig[tab];
    if (tabConfig) {
      crumbs[2].current = false;
      crumbs.push({
        name: tabConfig.label,
        href: `/colleges/${collegeSlug}${tabConfig.path}`,
        current: true,
      });
    }
  }

  return crumbs;
}

/**
 * Build breadcrumb trail for exam pages
 */
export function buildExamBreadcrumbTrail(
  examName: string,
  examSlug: string,
  silo?: keyof typeof examSiloConfig
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Exams", href: "/exams" },
    {
      name: examName,
      href: `/exams/${examSlug}`,
      current: !silo || silo === "info",
    },
  ];

  if (silo && silo !== "info") {
    const siloConfig = examSiloConfig[silo];
    if (siloConfig) {
      crumbs[2].current = false;
      crumbs.push({
        name: siloConfig.label,
        href: `/exams/${examSlug}${siloConfig.path}`,
        current: true,
      });
    }
  }

  return crumbs;
}

/**
 * Build breadcrumb trail for article pages
 */
export function buildArticleBreadcrumbTrail(
  articleTitle: string,
  articleSlug: string,
  category?: string
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/articles" },
  ];

  crumbs.push({
    name: truncateBreadcrumbName(articleTitle),
    href: `/articles/${articleSlug}`,
    current: true,
  });

  return crumbs;
}

/**
 * Build breadcrumb trail for filter/listing pages
 */
export function buildFilterBreadcrumbTrail(
  entityType: "colleges" | "exams",
  filters: {
    stream?: { name: string; slug: string };
    city?: { name: string; slug: string };
    state?: { name: string; slug: string };
  }
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [
    { name: "Home", href: "/" },
    {
      name: entityType === "colleges" ? "Colleges" : "Exams",
      href: `/${entityType}`,
      current: !filters.stream && !filters.city && !filters.state,
    },
  ];

  if (filters.stream) {
    const streamPath = `/${entityType}-stream-${filters.stream.slug}`;
    crumbs[1].current = false;
    crumbs.push({
      name: `${filters.stream.name} ${entityType === "colleges" ? "Colleges" : "Exams"}`,
      href: streamPath,
      current: !filters.city && !filters.state,
    });
  }

  if (filters.city) {
    const cityPath = filters.stream
      ? `/${entityType}-city-${filters.city.slug}-stream-${filters.stream.slug}`
      : `/${entityType}-city-${filters.city.slug}`;

    if (crumbs.length > 2) {
      crumbs[crumbs.length - 1].current = false;
    } else {
      crumbs[1].current = false;
    }

    crumbs.push({
      name: `${entityType === "colleges" ? "Colleges" : "Exams"} in ${filters.city.name}`,
      href: cityPath,
      current: true,
    });
  } else if (filters.state) {
    const statePath = filters.stream
      ? `/${entityType}-state-${filters.state.slug}-stream-${filters.stream.slug}`
      : `/${entityType}-state-${filters.state.slug}`;

    if (crumbs.length > 2) {
      crumbs[crumbs.length - 1].current = false;
    } else {
      crumbs[1].current = false;
    }

    crumbs.push({
      name: `${entityType === "colleges" ? "Colleges" : "Exams"} in ${filters.state.name}`,
      href: statePath,
      current: true,
    });
  }

  return crumbs;
}

/**
 * Build breadcrumb trail for author pages
 */
export function buildAuthorBreadcrumbTrail(
  authorName: string,
  authorSlug: string
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Authors", href: "/authors" },
    { name: authorName, href: `/authors/${authorSlug}`, current: true },
  ];
}

/**
 * Build breadcrumb trail for static pages
 */
export function buildStaticBreadcrumbTrail(
  pageName: string,
  pageHref: string
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: pageName, href: pageHref, current: true },
  ];
}

/**
 * Build breadcrumb trail for college news pages
 */
export function buildCollegeNewsBreadcrumbTrail(
  collegeName: string,
  collegeSlug: string,
  newsTitle: string,
  newsSlug: string
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Colleges", href: "/colleges" },
    { name: collegeName, href: `/colleges/${collegeSlug}` },
    { name: "News", href: `/colleges/${collegeSlug}/news` },
    {
      name: truncateBreadcrumbName(newsTitle),
      href: `/colleges/${collegeSlug}/news/${newsSlug}`,
      current: true,
    },
  ];
}

/**
 * Build breadcrumb trail for exam news pages
 */
export function buildExamNewsBreadcrumbTrail(
  examName: string,
  examSlug: string,
  newsTitle: string,
  newsSlug: string
): BreadcrumbItem[] {
  return [
    { name: "Home", href: "/" },
    { name: "Exams", href: "/exams" },
    { name: examName, href: `/exams/${examSlug}` },
    { name: "News", href: `/exams/${examSlug}/news` },
    {
      name: truncateBreadcrumbName(newsTitle),
      href: `/exams/${examSlug}/news/${newsSlug}`,
      current: true,
    },
  ];
}

/**
 * Truncate long breadcrumb names
 */
function truncateBreadcrumbName(name: string, maxLength = 40): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Convert breadcrumb trail to absolute URLs
 */
export function absolutizeBreadcrumbs(
  crumbs: BreadcrumbItem[]
): BreadcrumbItem[] {
  return crumbs.map((crumb) => ({
    ...crumb,
    href: crumb.href.startsWith("http")
      ? crumb.href
      : `${siteConfig.baseUrl}${crumb.href}`,
  }));
}
