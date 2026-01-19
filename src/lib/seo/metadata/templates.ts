/**
 * Metadata Templates
 * Entity-specific templates for generating SEO metadata
 */

import {
  siteConfig,
  seoDefaults,
  collegeTabConfig,
  examSiloConfig,
  getCurrentYear,
  truncateText,
  sanitizeForMeta,
  generateCollegeKeywords,
  generateExamKeywords,
} from "../config";

// Types for template inputs
export interface CollegeData {
  college_id: number;
  college_name: string;
  slug: string;
  city?: string;
  state?: string;
  logo_img?: string;
  streams?: string[];
  seo?: {
    title?: string;
    meta_desc?: string;
    seo_param?: string;
  };
}

export interface CollegeTabData extends CollegeData {
  tab: keyof typeof collegeTabConfig;
  tabContent?: {
    title?: string;
    meta_desc?: string;
    seo_param?: string;
  };
}

export interface ExamData {
  exam_id: number;
  exam_name: string;
  exam_full_name?: string;
  slug: string;
  exam_description?: string;
  logo_img?: string;
  streams?: string[];
  seo?: {
    title?: string;
    meta_desc?: string;
    seo_param?: string;
  };
}

export interface ExamSiloData extends ExamData {
  silo: keyof typeof examSiloConfig;
  siloContent?: {
    title?: string;
    meta_desc?: string;
    seo_param?: string;
  };
}

export interface ArticleData {
  article_id: number;
  title: string;
  slug: string;
  meta_desc?: string;
  author?: {
    author_id: number;
    author_name: string;
  };
  category?: string;
  img1_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthorData {
  author_id: number;
  author_name: string;
  view_name?: string;
  bio?: string;
  image_url?: string;
  article_count?: number;
}

export interface FilterPageData {
  entityType: "college" | "exam";
  stream?: { id: number; name: string };
  city?: { id: number; name: string };
  state?: { id: number; name: string };
  resultCount: number;
}

// Template result type
export interface MetadataTemplate {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  ogImage?: string;
}

// College Templates
export const collegeMetadataTemplates = {
  info: (data: CollegeData): MetadataTemplate => {
    const year = getCurrentYear();
    const location = formatLocation(data.city, data.state);
    const locationSuffix = location ? ` in ${location}` : "";

    const title =
      data.seo?.title ||
      `${data.college_name} - Courses, Fees, Admission ${year}`;

    const description =
      data.seo?.meta_desc ||
      `Explore ${data.college_name}${locationSuffix}. Check courses, fees, eligibility, placements, rankings, and admission process for ${year}.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.seo?.seo_param) ||
        generateCollegeKeywords(
          data.college_name,
          data.city,
          data.state,
          data.streams
        ),
      canonicalPath: `/colleges/${buildCollegeSlug(data)}`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  cutoffs: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();
    const location = formatLocation(data.city, data.state);
    const locationSuffix = location ? ` - ${location}` : "";

    const title =
      data.tabContent?.title ||
      `${data.college_name} Cutoffs ${year}${locationSuffix}`;

    const description =
      data.tabContent?.meta_desc ||
      `Check ${data.college_name} cutoffs ${year} for various courses including JEE Main, NEET, and other entrance exams. Get detailed cutoff trends, opening and closing ranks, category-wise cutoffs.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} cutoffs`,
        `${data.college_name} JEE cutoff`,
        `${data.college_name} NEET cutoff`,
        `${data.college_name} entrance exam cutoff`,
        `college cutoffs ${year}`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/cutoffs`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  courses: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();
    const location = formatLocation(data.city, data.state);

    const title =
      data.tabContent?.title ||
      `${data.college_name} Courses & Fees ${year}`;

    const description =
      data.tabContent?.meta_desc ||
      `Explore all courses offered at ${data.college_name}${location ? ` in ${location}` : ""}. Check course fees, duration, eligibility, and specializations for ${year} admission.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} courses`,
        `${data.college_name} fees`,
        `${data.college_name} programs`,
        `courses offered at ${data.college_name}`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/courses`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  fees: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} Fees Structure ${year}`;

    const description =
      data.tabContent?.meta_desc ||
      `Complete fee structure for ${data.college_name}. Check tuition fees, hostel fees, and other charges for all courses. Scholarship and financial aid information.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} fees`,
        `${data.college_name} fee structure`,
        `${data.college_name} tuition fees`,
        `${data.college_name} hostel fees`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/fees`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  placements: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} Placements ${year} - Packages, Recruiters`;

    const description =
      data.tabContent?.meta_desc ||
      `${data.college_name} placement statistics for ${year}. Check average and highest packages, top recruiters, placement percentage, and career opportunities.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} placements`,
        `${data.college_name} placement ${year}`,
        `${data.college_name} average package`,
        `${data.college_name} recruiters`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/placements`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  "admission-process": (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} Admission ${year} - Process, Dates, Eligibility`;

    const description =
      data.tabContent?.meta_desc ||
      `Complete admission guide for ${data.college_name} ${year}. Check admission process, important dates, eligibility criteria, required documents, and how to apply.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} admission`,
        `${data.college_name} admission ${year}`,
        `how to apply ${data.college_name}`,
        `${data.college_name} admission process`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/admission-process`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  faq: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();
    const location = formatLocation(data.city, data.state);

    const title =
      data.tabContent?.title ||
      `${data.college_name} FAQ ${year} - Admission, Courses, Fees`;

    const description =
      data.tabContent?.meta_desc ||
      `Get answers to frequently asked questions about ${data.college_name}${location ? ` in ${location}` : ""}. FAQs about admission, courses, fees, placements, and campus life.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} FAQ`,
        `${data.college_name} questions`,
        `${data.college_name} admission FAQ`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/faq`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  rankings: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} Rankings ${year} - NIRF, QS, Times`;

    const description =
      data.tabContent?.meta_desc ||
      `${data.college_name} rankings in NIRF, QS World Rankings, Times Higher Education, and other ranking bodies. Compare rankings across years.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} ranking`,
        `${data.college_name} NIRF ranking`,
        `${data.college_name} QS ranking`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/rankings`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  scholarship: (data: CollegeTabData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} Scholarships ${year} - Eligibility, Amount`;

    const description =
      data.tabContent?.meta_desc ||
      `Scholarships available at ${data.college_name} for ${year}. Check scholarship types, eligibility criteria, application process, and amount details.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} scholarship`,
        `${data.college_name} financial aid`,
        `scholarships for ${data.college_name}`,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}/scholarship`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  // Generic tab template for less common tabs
  generic: (data: CollegeTabData): MetadataTemplate => {
    const tabConfig = collegeTabConfig[data.tab];
    const tabLabel = tabConfig?.label || data.tab;
    const year = getCurrentYear();

    const title =
      data.tabContent?.title ||
      `${data.college_name} ${tabLabel} ${year}`;

    const description =
      data.tabContent?.meta_desc ||
      `Explore ${tabLabel.toLowerCase()} information for ${data.college_name}. Get comprehensive details and latest updates for ${year}.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.tabContent?.seo_param) || [
        `${data.college_name} ${tabLabel.toLowerCase()}`,
        data.college_name,
      ],
      canonicalPath: `/colleges/${buildCollegeSlug(data)}${tabConfig?.path || `/${data.tab}`}`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },
};

// Exam Templates
export const examMetadataTemplates = {
  info: (data: ExamData): MetadataTemplate => {
    const year = getCurrentYear();
    const examName = data.exam_full_name || data.exam_name;

    const title =
      data.seo?.title ||
      `${examName} ${year} - Dates, Eligibility, Syllabus, Pattern`;

    const description =
      data.seo?.meta_desc ||
      `Complete guide to ${examName} ${year}. Check exam dates, eligibility criteria, syllabus, exam pattern, application process, and important updates.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.seo?.seo_param) ||
        generateExamKeywords(data.exam_name, data.exam_full_name, data.streams),
      canonicalPath: `/exams/${buildExamSlug(data)}`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  "exam-syllabus": (data: ExamSiloData): MetadataTemplate => {
    const year = getCurrentYear();
    const examName = data.exam_full_name || data.exam_name;

    const title =
      data.siloContent?.title ||
      `${data.exam_name} Syllabus ${year} - Subject-wise Topics, Weightage`;

    const description =
      data.siloContent?.meta_desc ||
      `Complete ${examName} syllabus for ${year}. Subject-wise topics, weightage, important chapters, and preparation tips.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.siloContent?.seo_param) || [
        `${data.exam_name} syllabus`,
        `${data.exam_name} syllabus ${year}`,
        `${data.exam_name} topics`,
        `${data.exam_name} chapters`,
      ],
      canonicalPath: `/exams/${buildExamSlug(data)}/exam-syllabus`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  "exam-pattern": (data: ExamSiloData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.siloContent?.title ||
      `${data.exam_name} Exam Pattern ${year} - Marking Scheme, Duration`;

    const description =
      data.siloContent?.meta_desc ||
      `${data.exam_name} exam pattern ${year}. Check total marks, number of questions, section-wise distribution, marking scheme, and time duration.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.siloContent?.seo_param) || [
        `${data.exam_name} exam pattern`,
        `${data.exam_name} marking scheme`,
        `${data.exam_name} paper pattern`,
      ],
      canonicalPath: `/exams/${buildExamSlug(data)}/exam-pattern`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  "exam-cutoff": (data: ExamSiloData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.siloContent?.title ||
      `${data.exam_name} Cutoff ${year} - Category-wise, Previous Years`;

    const description =
      data.siloContent?.meta_desc ||
      `${data.exam_name} cutoff ${year}. Check expected cutoff, previous year cutoffs, category-wise cutoff marks, and cutoff trends.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.siloContent?.seo_param) || [
        `${data.exam_name} cutoff`,
        `${data.exam_name} cutoff ${year}`,
        `${data.exam_name} expected cutoff`,
        `${data.exam_name} category cutoff`,
      ],
      canonicalPath: `/exams/${buildExamSlug(data)}/exam-cutoff`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  "exam-result": (data: ExamSiloData): MetadataTemplate => {
    const year = getCurrentYear();

    const title =
      data.siloContent?.title ||
      `${data.exam_name} Result ${year} - Date, How to Check, Scorecard`;

    const description =
      data.siloContent?.meta_desc ||
      `${data.exam_name} result ${year}. Check result date, how to download scorecard, rank list, and result statistics.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.siloContent?.seo_param) || [
        `${data.exam_name} result`,
        `${data.exam_name} result ${year}`,
        `${data.exam_name} scorecard`,
        `${data.exam_name} rank list`,
      ],
      canonicalPath: `/exams/${buildExamSlug(data)}/exam-result`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },

  // Generic silo template
  generic: (data: ExamSiloData): MetadataTemplate => {
    const siloConfig = examSiloConfig[data.silo as keyof typeof examSiloConfig];
    const siloLabel = siloConfig?.label || data.silo;
    const year = getCurrentYear();

    const title =
      data.siloContent?.title ||
      `${data.exam_name} ${siloLabel} ${year}`;

    const description =
      data.siloContent?.meta_desc ||
      `Get complete ${siloLabel.toLowerCase()} information for ${data.exam_name} ${year}. Latest updates and comprehensive guide.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: parseKeywords(data.siloContent?.seo_param) || [
        `${data.exam_name} ${siloLabel.toLowerCase()}`,
        data.exam_name,
      ],
      canonicalPath: `/exams/${buildExamSlug(data)}${siloConfig?.path || `/${data.silo}`}`,
      ogImage: data.logo_img || siteConfig.ogImage,
    };
  },
};

// Article Templates
export const articleMetadataTemplates = {
  article: (data: ArticleData): MetadataTemplate => {
    const title = data.title;

    const description =
      data.meta_desc ||
      `Read ${data.title} on TrueScholar. Get expert insights and comprehensive information.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: [data.category || "education", "TrueScholar", "India"].filter(
        Boolean
      ) as string[],
      canonicalPath: `/articles/${buildArticleSlug(data)}`,
      ogImage: data.img1_url || siteConfig.ogImage,
    };
  },
};

// Author Templates
export const authorMetadataTemplates = {
  author: (data: AuthorData): MetadataTemplate => {
    const name = data.view_name || data.author_name;
    const articleCount = data.article_count || 0;

    const title = `${name} - Author at TrueScholar`;

    const description =
      data.bio ||
      `Read articles by ${name} on TrueScholar.${articleCount > 0 ? ` ${articleCount} articles published.` : ""} Expert insights on education in India.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: [name, "author", "TrueScholar", "education expert"],
      canonicalPath: `/authors/${buildAuthorSlug(data)}`,
      ogImage: data.image_url || siteConfig.ogImage,
    };
  },
};

// Filter Page Templates
export const filterMetadataTemplates = {
  colleges: (data: FilterPageData): MetadataTemplate => {
    const year = getCurrentYear();
    const parts: string[] = [];
    let locationPart = "";

    if (data.stream) parts.push(data.stream.name);
    parts.push("Colleges");
    if (data.city) {
      locationPart = `in ${data.city.name}`;
    } else if (data.state) {
      locationPart = `in ${data.state.name}`;
    }

    const titleBase = parts.join(" ");
    const title = locationPart
      ? `Top ${titleBase} ${locationPart} ${year}`
      : `Top ${titleBase} in India ${year}`;

    const streamDesc = data.stream ? `${data.stream.name.toLowerCase()} ` : "";
    const locationDesc = data.city
      ? `in ${data.city.name}`
      : data.state
        ? `in ${data.state.name}`
        : "in India";

    const description = `Find the best ${streamDesc}colleges ${locationDesc}. Compare ${data.resultCount > 0 ? data.resultCount : ""} colleges by ranking, fees, placements, and admission criteria for ${year}.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: buildFilterKeywords(data),
      canonicalPath: buildFilterCanonicalPath(data),
      ogImage: siteConfig.ogImage,
    };
  },

  exams: (data: FilterPageData): MetadataTemplate => {
    const year = getCurrentYear();
    const streamName = data.stream?.name || "";

    const title = streamName
      ? `${streamName} Entrance Exams ${year} - Complete List`
      : `Top Entrance Exams in India ${year}`;

    const description = streamName
      ? `Complete list of ${streamName.toLowerCase()} entrance exams in India for ${year}. Check exam dates, eligibility, syllabus, and application process.`
      : `Complete list of entrance exams in India for ${year}. Engineering, Medical, Management, and more.`;

    return {
      title: truncateText(title, seoDefaults.titleMaxLength + 15),
      description: truncateText(
        sanitizeForMeta(description),
        seoDefaults.descriptionMaxLength
      ),
      keywords: [
        `${streamName} exams`.trim(),
        `entrance exams ${year}`,
        "competitive exams India",
        `${streamName} entrance exams`.trim(),
      ].filter((k) => k.length > 0),
      canonicalPath: buildFilterCanonicalPath(data),
      ogImage: siteConfig.ogImage,
    };
  },
};

// Helper Functions
function formatLocation(city?: string, state?: string): string {
  if (city && state) return `${city}, ${state}`;
  return city || state || "";
}

function parseKeywords(seoParam?: string): string[] | null {
  if (!seoParam) return null;
  return seoParam
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, seoDefaults.keywordsMaxCount);
}

function buildCollegeSlug(data: CollegeData): string {
  const baseSlug = data.slug.replace(/(?:-\d+)+$/, "");
  return `${baseSlug}-${data.college_id}`;
}

function buildExamSlug(data: ExamData): string {
  const baseSlug = data.slug.replace(/-\d+$/, "");
  return `${baseSlug}-${data.exam_id}`;
}

function buildArticleSlug(data: ArticleData): string {
  const baseSlug = data.slug.replace(/\s+/g, "-").toLowerCase();
  return `${baseSlug}-${data.article_id}`;
}

function buildAuthorSlug(data: AuthorData): string {
  const name = (data.view_name || data.author_name || "author")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-\d+$/, "");
  return `${name}-${data.author_id}`;
}

function buildFilterKeywords(data: FilterPageData): string[] {
  const keywords: string[] = [];
  const year = getCurrentYear();

  if (data.stream) {
    keywords.push(`${data.stream.name} colleges`);
    keywords.push(`best ${data.stream.name.toLowerCase()} colleges`);
  }

  if (data.city) {
    keywords.push(`colleges in ${data.city.name}`);
    if (data.stream) {
      keywords.push(`${data.stream.name} colleges in ${data.city.name}`);
    }
  }

  if (data.state) {
    keywords.push(`colleges in ${data.state.name}`);
    if (data.stream) {
      keywords.push(`${data.stream.name} colleges in ${data.state.name}`);
    }
  }

  keywords.push(`top colleges ${year}`);

  return keywords.slice(0, seoDefaults.keywordsMaxCount);
}

function buildFilterCanonicalPath(data: FilterPageData): string {
  const parts: string[] = [data.entityType === "college" ? "colleges" : "exams"];

  if (data.stream) {
    parts.push(`stream-${formatSlug(data.stream.name)}`);
  }

  if (data.city) {
    parts.push(`city-${formatSlug(data.city.name)}`);
  } else if (data.state) {
    parts.push(`state-${formatSlug(data.state.name)}`);
  }

  return `/${parts.join("-")}`;
}

function formatSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Get template for college tab
export function getCollegeTabTemplate(
  tab: string
): ((data: CollegeTabData) => MetadataTemplate) {
  const templates = collegeMetadataTemplates as Record<
    string,
    (data: CollegeTabData) => MetadataTemplate
  >;
  return templates[tab] || templates.generic;
}

// Get template for exam silo
export function getExamSiloTemplate(
  silo: string
): ((data: ExamSiloData) => MetadataTemplate) {
  const templates = examMetadataTemplates as Record<
    string,
    (data: ExamSiloData) => MetadataTemplate
  >;
  return templates[silo] || templates.generic;
}
