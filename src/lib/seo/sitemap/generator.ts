/**
 * Optimized Sitemap Generator
 * Handles large-scale sitemap generation with chunking and caching
 */

import { siteConfig, revalidationTimes } from "../config";
import {
  buildCollegeUrl,
  buildExamUrl,
  buildArticleUrl,
} from "../linking/url-builders";

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export interface SitemapGeneratorOptions {
  baseUrl?: string;
  defaultChangefreq?: SitemapUrl["changefreq"];
  defaultPriority?: number;
  includeLastmod?: boolean;
}

/**
 * Generate sitemap XML from URLs
 */
export function generateSitemapXml(
  urls: SitemapUrl[],
  options: SitemapGeneratorOptions = {}
): string {
  const { includeLastmod = true } = options;

  const urlEntries = urls
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.url)}</loc>`];

      if (includeLastmod && entry.lastmod) {
        parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }

      if (entry.changefreq) {
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      }

      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }

      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index XML
 */
export function generateSitemapIndexXml(
  sitemaps: Array<{ url: string; lastmod?: string }>
): string {
  const entries = sitemaps
    .map((sitemap) => {
      const parts = [`    <loc>${escapeXml(sitemap.url)}</loc>`];
      if (sitemap.lastmod) {
        parts.push(`    <lastmod>${sitemap.lastmod}</lastmod>`);
      }
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Validate URL for sitemap inclusion
 */
export function isValidSitemapUrl(url: string): boolean {
  if (!url) return false;

  // Check for invalid characters
  const invalidChars = /[&<>"']/;
  if (invalidChars.test(url)) return false;

  // Check URL format
  try {
    new URL(url);
    return true;
  } catch {
    // Try with base URL
    try {
      new URL(url, siteConfig.baseUrl);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Calculate sitemap priority based on entity type and importance
 */
export function calculatePriority(
  entityType: "college" | "exam" | "article" | "author" | "filter",
  options?: {
    isHomePage?: boolean;
    ranking?: number;
    hasRichContent?: boolean;
    isRecent?: boolean;
  }
): number {
  let basePriority: number;

  switch (entityType) {
    case "college":
      basePriority = 0.8;
      break;
    case "exam":
      basePriority = 0.8;
      break;
    case "article":
      basePriority = 0.6;
      break;
    case "author":
      basePriority = 0.5;
      break;
    case "filter":
      basePriority = 0.5;
      break;
    default:
      basePriority = 0.5;
  }

  // Adjust based on options
  if (options?.isHomePage) {
    return 1.0;
  }

  if (options?.ranking && options.ranking <= 10) {
    basePriority = Math.min(1.0, basePriority + 0.2);
  } else if (options?.ranking && options.ranking <= 50) {
    basePriority = Math.min(1.0, basePriority + 0.1);
  }

  if (options?.hasRichContent) {
    basePriority = Math.min(1.0, basePriority + 0.1);
  }

  if (options?.isRecent) {
    basePriority = Math.min(1.0, basePriority + 0.1);
  }

  return Math.round(basePriority * 10) / 10;
}

/**
 * Calculate change frequency based on entity type
 */
export function calculateChangeFreq(
  entityType: "college" | "exam" | "article" | "author" | "filter" | "static",
  options?: {
    hasNews?: boolean;
    isTimesSensitive?: boolean;
  }
): SitemapUrl["changefreq"] {
  if (options?.isTimesSensitive) {
    return "daily";
  }

  if (options?.hasNews) {
    return "daily";
  }

  switch (entityType) {
    case "college":
      return "weekly";
    case "exam":
      return "weekly";
    case "article":
      return "monthly";
    case "author":
      return "monthly";
    case "filter":
      return "weekly";
    case "static":
      return "monthly";
    default:
      return "weekly";
  }
}

/**
 * Format date for sitemap lastmod
 */
export function formatLastmod(date: Date | string | undefined): string {
  if (!date) {
    return new Date().toISOString().split("T")[0];
  }

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return d.toISOString().split("T")[0];
}

/**
 * Build sitemap URL entry for a college
 */
export function buildCollegeSitemapEntry(
  college: {
    college_id: number;
    slug: string;
    updated_at?: string;
    ranking?: number;
  },
  tab?: string
): SitemapUrl {
  const relativeUrl = buildCollegeUrl(college.slug, college.college_id);
  const tabPath = tab ? `/${tab}` : "";
  const url = `${siteConfig.baseUrl}${relativeUrl}${tabPath}`;

  let priority = 0.8;
  let changefreq: SitemapUrl["changefreq"] = "weekly";

  if (!tab) {
    priority = 1.0;
  } else if (tab === "admission-process" || tab === "news") {
    priority = 0.8;
    changefreq = "weekly";
  } else if (tab === "cutoffs" || tab === "scholarship") {
    priority = 0.7;
  } else {
    priority = 0.6;
  }

  if (college.ranking && college.ranking <= 50) {
    priority = Math.min(1.0, priority + 0.1);
  }

  return {
    url,
    lastmod: formatLastmod(college.updated_at),
    changefreq,
    priority,
  };
}

/**
 * Build sitemap URL entry for an exam
 */
export function buildExamSitemapEntry(
  exam: {
    exam_id: number;
    slug: string;
    updated_at?: string;
  },
  silo?: string
): SitemapUrl {
  const relativeUrl = buildExamUrl(exam.slug, exam.exam_id);
  const siloPath = silo ? `/${silo}` : "";
  const url = `${siteConfig.baseUrl}${relativeUrl}${siloPath}`;

  let priority = 0.8;
  let changefreq: SitemapUrl["changefreq"] = "weekly";

  if (!silo) {
    priority = 0.8;
  } else if (silo === "news") {
    priority = 0.9;
    changefreq = "daily";
  } else if (silo === "exam-cutoff" || silo === "exam-result") {
    priority = 0.8;
  } else if (silo === "exam-syllabus" || silo === "exam-pattern") {
    priority = 0.7;
  } else {
    priority = 0.6;
  }

  return {
    url,
    lastmod: formatLastmod(exam.updated_at),
    changefreq,
    priority,
  };
}

/**
 * Build sitemap URL entry for an article
 */
export function buildArticleSitemapEntry(article: {
  article_id: number;
  slug: string;
  updated_at?: string;
  is_featured?: boolean;
}): SitemapUrl {
  const relativeUrl = buildArticleUrl(article.slug, article.article_id);
  const url = `${siteConfig.baseUrl}${relativeUrl}`;

  return {
    url,
    lastmod: formatLastmod(article.updated_at),
    changefreq: "monthly",
    priority: article.is_featured ? 0.8 : 0.6,
  };
}

/**
 * Build static page sitemap entries
 */
export function getStaticSitemapEntries(): SitemapUrl[] {
  const baseUrl = siteConfig.baseUrl;
  const now = formatLastmod(new Date());

  return [
    { url: baseUrl, priority: 1.0, changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/colleges`, priority: 0.9, changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/exams`, priority: 0.9, changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/articles`, priority: 0.8, changefreq: "daily", lastmod: now },
    { url: `${baseUrl}/compare-colleges`, priority: 0.7, changefreq: "weekly", lastmod: now },
    { url: `${baseUrl}/about-us`, priority: 0.5, changefreq: "monthly", lastmod: now },
    { url: `${baseUrl}/contact-us`, priority: 0.5, changefreq: "monthly", lastmod: now },
    { url: `${baseUrl}/privacy-policy`, priority: 0.3, changefreq: "yearly", lastmod: now },
    { url: `${baseUrl}/terms-and-conditions`, priority: 0.3, changefreq: "yearly", lastmod: now },
  ];
}
