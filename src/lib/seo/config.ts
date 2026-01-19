/**
 * SEO Configuration
 * Central configuration for all SEO-related settings
 */

// Site Configuration
export const siteConfig = {
  name: "TrueScholar",
  tagline: "Find Your Perfect College & Scholarships in India",
  description:
    "TrueScholar helps students discover the best colleges, programs, and scholarships in India. Compare courses, check eligibility, and plan your academic future with ease.",
  baseUrl:
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.truescholar.in",
  logo: "https://www.truescholar.in/logo.webp",
  favicon: "https://www.truescholar.in/favicon.ico",
  ogImage: "https://www.truescholar.in/og-image.png",
  twitterHandle: "@truescholar",
  locale: "en_IN",
  language: "en",
} as const;

// Social Links
export const socialLinks = {
  facebook: "https://www.facebook.com/profile.php?id=61578705477317",
  instagram: "https://www.instagram.com/truescholar_india/",
  linkedin: "https://www.linkedin.com/in/truescholar-pvt-25b1a7376/",
  twitter: "https://twitter.com/truescholar",
} as const;

// SEO Defaults
export const seoDefaults = {
  titleSuffix: " | TrueScholar",
  titleMaxLength: 60,
  descriptionMaxLength: 160,
  descriptionMinLength: 50,
  keywordsMaxCount: 10,
} as const;

// Content Quality Thresholds
export const contentQuality = {
  // Minimum word count to avoid thin content penalty
  minWordCount: 300,
  // Minimum unique content ratio (vs template text)
  minUniqueContentRatio: 0.4,
  // Minimum number of sections/headings for quality content
  minSections: 2,
  // Minimum FAQ count for FAQ pages
  minFaqCount: 3,
} as const;

// Revalidation Times (in seconds)
export const revalidationTimes = {
  // High-traffic pages - more frequent updates
  college: 21600, // 6 hours
  exam: 21600, // 6 hours
  article: 43200, // 12 hours
  // Medium-traffic pages
  collegeSub: 43200, // 12 hours (cutoffs, fees, etc.)
  examSilo: 43200, // 12 hours (syllabus, pattern, etc.)
  // Low-traffic/stable pages
  static: 86400, // 24 hours
  filter: 86400, // 24 hours
  author: 86400, // 24 hours
  // Sitemap
  sitemap: 3600, // 1 hour
} as const;

// Entity Types
export type EntityType =
  | "college"
  | "college-tab"
  | "exam"
  | "exam-silo"
  | "article"
  | "author"
  | "filter"
  | "static";

// Tab/Silo Configurations
export const collegeTabConfig = {
  info: { priority: 1.0, label: "Info", path: "" },
  "admission-process": {
    priority: 0.8,
    label: "Admission Process",
    path: "/admission-process",
  },
  courses: { priority: 0.8, label: "Courses", path: "/courses" },
  cutoffs: { priority: 0.7, label: "Cutoffs", path: "/cutoffs" },
  eligibility: { priority: 0.6, label: "Eligibility", path: "/eligibility" },
  facilities: { priority: 0.6, label: "Facilities", path: "/facilities" },
  faq: { priority: 0.6, label: "FAQ", path: "/faq" },
  fees: { priority: 0.7, label: "Fees", path: "/fees" },
  highlights: { priority: 0.6, label: "Highlights", path: "/highlights" },
  news: { priority: 0.9, label: "News", path: "/news" },
  others: { priority: 0.5, label: "Others", path: "/others" },
  placements: { priority: 0.8, label: "Placements", path: "/placements" },
  rankings: { priority: 0.7, label: "Rankings", path: "/rankings" },
  results: { priority: 0.6, label: "Results", path: "/results" },
  reviews: { priority: 0.6, label: "Reviews", path: "/reviews" },
  scholarship: { priority: 0.7, label: "Scholarship", path: "/scholarship" },
} as const;

export const examSiloConfig = {
  info: { priority: 0.8, label: "Info", path: "" },
  "exam-syllabus": { priority: 0.7, label: "Syllabus", path: "/exam-syllabus" },
  "exam-pattern": { priority: 0.7, label: "Pattern", path: "/exam-pattern" },
  "exam-cutoff": { priority: 0.8, label: "Cutoff", path: "/exam-cutoff" },
  "exam-result": { priority: 0.8, label: "Result", path: "/exam-result" },
  "admit-card": { priority: 0.7, label: "Admit Card", path: "/admit-card" },
  "exam-dates": { priority: 0.7, label: "Dates", path: "/exam-dates" },
  "exam-eligibility": {
    priority: 0.6,
    label: "Eligibility",
    path: "/exam-eligibility",
  },
  "exam-registration": {
    priority: 0.7,
    label: "Registration",
    path: "/exam-registration",
  },
  news: { priority: 0.9, label: "News", path: "/news" },
} as const;

// Publisher Information (for Article schema)
export const publisherInfo = {
  name: "TrueScholar",
  logo: {
    url: "https://www.truescholar.in/logo.webp",
    width: 600,
    height: 100,
  },
} as const;

// Contact Information
export const contactInfo = {
  email: "support@truescholar.in",
  type: "customer service",
  availableLanguage: ["English", "Hindi"],
} as const;

// Utility Functions
export function getBaseUrl(): string {
  return siteConfig.baseUrl;
}

export function buildCanonicalUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function formatTitleWithSuffix(
  title: string,
  includeSuffix = true
): string {
  if (!includeSuffix) return title;
  if (title.includes("TrueScholar")) return title;
  return `${title}${seoDefaults.titleSuffix}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

export function sanitizeForMeta(text: string): string {
  return text
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "")
    .trim();
}

// Keywords Generation Helpers
export function generateCollegeKeywords(
  collegeName: string,
  city?: string,
  state?: string,
  streams?: string[]
): string[] {
  const keywords: string[] = [
    collegeName,
    `${collegeName} admission`,
    `${collegeName} courses`,
    `${collegeName} fees`,
    `${collegeName} placements`,
  ];

  if (city) {
    keywords.push(`colleges in ${city}`, `${collegeName} ${city}`);
  }

  if (state) {
    keywords.push(`colleges in ${state}`);
  }

  if (streams && streams.length > 0) {
    streams.forEach((stream) => {
      keywords.push(`${stream} colleges`, `${collegeName} ${stream}`);
    });
  }

  return keywords.slice(0, seoDefaults.keywordsMaxCount);
}

export function generateExamKeywords(
  examName: string,
  examFullName?: string,
  streams?: string[]
): string[] {
  const keywords: string[] = [
    examName,
    `${examName} exam`,
    `${examName} ${getCurrentYear()}`,
    `${examName} syllabus`,
    `${examName} pattern`,
    `${examName} cutoff`,
    `${examName} result`,
  ];

  if (examFullName && examFullName !== examName) {
    keywords.unshift(examFullName);
  }

  if (streams && streams.length > 0) {
    streams.forEach((stream) => {
      keywords.push(`${stream} entrance exams`);
    });
  }

  return keywords.slice(0, seoDefaults.keywordsMaxCount);
}
