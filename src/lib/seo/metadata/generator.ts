/**
 * Unified Metadata Generator
 * Central function for generating Next.js Metadata objects
 */

import { Metadata } from "next";
import {
  siteConfig,
  buildCanonicalUrl,
  formatTitleWithSuffix,
  EntityType,
} from "../config";
import {
  CollegeData,
  CollegeTabData,
  ExamData,
  ExamSiloData,
  ArticleData,
  AuthorData,
  FilterPageData,
  MetadataTemplate,
  collegeMetadataTemplates,
  examMetadataTemplates,
  articleMetadataTemplates,
  authorMetadataTemplates,
  filterMetadataTemplates,
  getCollegeTabTemplate,
  getExamSiloTemplate,
} from "./templates";
import { validateContent, getRobotsDirective } from "./validators";

// Input types for the generator
export type MetadataInput =
  | { type: "college"; data: CollegeData; content?: string }
  | { type: "college-tab"; data: CollegeTabData; content?: string }
  | { type: "exam"; data: ExamData; content?: string }
  | { type: "exam-silo"; data: ExamSiloData; content?: string }
  | { type: "article"; data: ArticleData; content?: string }
  | { type: "author"; data: AuthorData }
  | { type: "filter"; data: FilterPageData }
  | { type: "static"; data: StaticPageData };

export interface StaticPageData {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface GeneratedMetadata extends Metadata {
  // Extended with internal tracking
  _validation?: {
    score: number;
    issues: string[];
    shouldIndex: boolean;
  };
}

/**
 * Main metadata generator function
 * Use this in generateMetadata() in page components
 */
export function generatePageMetadata(input: MetadataInput): Metadata {
  let template: MetadataTemplate;

  switch (input.type) {
    case "college":
      template = collegeMetadataTemplates.info(input.data);
      break;

    case "college-tab":
      template = getCollegeTabTemplate(input.data.tab)(input.data);
      break;

    case "exam":
      template = examMetadataTemplates.info(input.data);
      break;

    case "exam-silo":
      template = getExamSiloTemplate(input.data.silo)(input.data);
      break;

    case "article":
      template = articleMetadataTemplates.article(input.data);
      break;

    case "author":
      template = authorMetadataTemplates.author(input.data);
      break;

    case "filter":
      template =
        input.data.entityType === "college"
          ? filterMetadataTemplates.colleges(input.data)
          : filterMetadataTemplates.exams(input.data);
      break;

    case "static":
      template = {
        title: input.data.title,
        description: input.data.description,
        keywords: input.data.keywords || [],
        canonicalPath: input.data.canonicalPath,
        ogImage: input.data.ogImage,
      };
      break;

    default:
      throw new Error(`Unknown metadata type: ${(input as any).type}`);
  }

  // Validate content quality
  const contentToValidate =
    "content" in input ? input.content : undefined;
  const validation = validateContent({
    title: template.title,
    description: template.description,
    content: contentToValidate,
  });

  // Build the canonical URL
  const canonicalUrl = buildCanonicalUrl(template.canonicalPath);

  // Build robots directive
  const shouldNoIndex =
    input.type === "static" && (input.data as StaticPageData).noIndex;
  const robotsDirective = shouldNoIndex
    ? { index: false, follow: true }
    : validation.shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: true };

  // Build the metadata object
  const metadata: Metadata = {
    title: formatTitleWithSuffix(template.title),
    description: template.description,
    keywords: template.keywords,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Robots
    robots: robotsDirective,

    // Open Graph
    openGraph: {
      title: template.title,
      description: template.description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: getOgType(input.type),
      locale: siteConfig.locale,
      images: template.ogImage
        ? [
            {
              url: template.ogImage,
              width: 1200,
              height: 630,
              alt: template.title,
            },
          ]
        : undefined,
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: template.title,
      description: template.description,
      images: template.ogImage ? [template.ogImage] : undefined,
      creator: siteConfig.twitterHandle,
    },
  };

  // Add article-specific metadata
  if (input.type === "article") {
    const articleData = input.data as ArticleData;
    metadata.openGraph = {
      ...metadata.openGraph,
      type: "article",
      publishedTime: articleData.created_at,
      modifiedTime: articleData.updated_at,
      authors: articleData.author
        ? [articleData.author.author_name]
        : undefined,
    };
  }

  return metadata;
}

/**
 * Generate metadata for error/not found pages
 */
export function generateErrorMetadata(
  type: "not-found" | "error",
  entityType?: string
): Metadata {
  const entityLabel = entityType
    ? entityType.charAt(0).toUpperCase() + entityType.slice(1)
    : "Page";

  if (type === "not-found") {
    return {
      title: `${entityLabel} Not Found | TrueScholar`,
      description: `The requested ${entityType || "page"} could not be found. Browse our comprehensive database on TrueScholar.`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `Error Loading ${entityLabel} | TrueScholar`,
    description: `We encountered an error while loading this ${entityType || "page"}. Please try again later.`,
    robots: { index: false, follow: true },
  };
}

/**
 * Generate metadata for listing pages
 */
export function generateListingMetadata(
  entityType: "colleges" | "exams" | "articles",
  filters?: { stream?: string; city?: string; state?: string }
): Metadata {
  const year = new Date().getFullYear();

  const titles: Record<string, string> = {
    colleges: "Top Colleges in India",
    exams: "Entrance Exams in India",
    articles: "Education Articles & News",
  };

  const descriptions: Record<string, string> = {
    colleges: `Discover top colleges in India ${year}. Compare courses, fees, placements, and rankings to find the best fit for your academic goals.`,
    exams: `Complete list of entrance exams in India ${year}. Get exam dates, eligibility, syllabus, and preparation tips.`,
    articles: `Latest education news, college updates, exam notifications, and expert articles on TrueScholar.`,
  };

  let title = titles[entityType];
  let description = descriptions[entityType];
  let canonicalPath = `/${entityType}`;

  // Apply filters to title/description
  if (filters) {
    if (filters.stream) {
      title = `Top ${filters.stream} ${entityType === "colleges" ? "Colleges" : "Exams"} in India ${year}`;
      canonicalPath = `/${entityType}-stream-${filters.stream.toLowerCase().replace(/\s+/g, "-")}`;
    }
    if (filters.city) {
      title = `${entityType === "colleges" ? "Colleges" : "Exams"} in ${filters.city} ${year}`;
      canonicalPath = `/${entityType}-city-${filters.city.toLowerCase().replace(/\s+/g, "-")}`;
    }
    if (filters.stream && filters.city) {
      title = `${filters.stream} ${entityType === "colleges" ? "Colleges" : "Exams"} in ${filters.city} ${year}`;
      canonicalPath = `/${entityType}-city-${filters.city.toLowerCase().replace(/\s+/g, "-")}-stream-${filters.stream.toLowerCase().replace(/\s+/g, "-")}`;
    }
  }

  return {
    title: formatTitleWithSuffix(title),
    description,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
    },
    openGraph: {
      title,
      description,
      url: buildCanonicalUrl(canonicalPath),
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Helper function to determine OG type
function getOgType(
  entityType: EntityType | "static"
): "website" | "article" | "profile" {
  switch (entityType) {
    case "article":
      return "article";
    case "author":
      return "profile";
    default:
      return "website";
  }
}

/**
 * Merge custom metadata with generated metadata
 * Use when you need to override specific fields
 */
export function mergeMetadata(
  generated: Metadata,
  overrides: Partial<Metadata>
): Metadata {
  return {
    ...generated,
    ...overrides,
    openGraph: {
      ...generated.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...generated.twitter,
      ...overrides.twitter,
    },
    alternates: {
      ...generated.alternates,
      ...overrides.alternates,
    },
  };
}
