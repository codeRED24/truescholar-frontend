/**
 * Content Quality Validators
 * Detects thin content, duplicate content, and quality issues
 */

import { contentQuality, seoDefaults } from "../config";

export interface ContentValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ContentIssue[];
  recommendations: string[];
  shouldIndex: boolean;
  shouldNoFollow: boolean;
}

export interface ContentIssue {
  type: ContentIssueType;
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}

export type ContentIssueType =
  | "thin_content"
  | "missing_title"
  | "missing_description"
  | "short_title"
  | "short_description"
  | "long_title"
  | "long_description"
  | "duplicate_title"
  | "missing_h1"
  | "missing_content"
  | "low_unique_ratio"
  | "missing_faq"
  | "insufficient_faq";

export interface ContentInput {
  title?: string;
  description?: string;
  content?: string;
  h1?: string;
  faqs?: Array<{ question: string; answer: string }>;
  wordCount?: number;
}

/**
 * Validates content quality and returns indexability recommendation
 */
export function validateContent(input: ContentInput): ContentValidationResult {
  const issues: ContentIssue[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    issues.push({
      type: "missing_title",
      severity: "error",
      message: "Page is missing a title tag",
      field: "title",
    });
    score -= 25;
  } else {
    const titleLength = input.title.length;
    if (titleLength < 30) {
      issues.push({
        type: "short_title",
        severity: "warning",
        message: `Title is too short (${titleLength} chars). Aim for 50-60 characters.`,
        field: "title",
      });
      score -= 10;
      recommendations.push("Expand title to include more descriptive keywords");
    }
    if (titleLength > seoDefaults.titleMaxLength + 10) {
      issues.push({
        type: "long_title",
        severity: "warning",
        message: `Title is too long (${titleLength} chars). May be truncated in SERPs.`,
        field: "title",
      });
      score -= 5;
      recommendations.push(
        `Shorten title to under ${seoDefaults.titleMaxLength} characters`
      );
    }
  }

  // Description validation
  if (!input.description || input.description.trim().length === 0) {
    issues.push({
      type: "missing_description",
      severity: "error",
      message: "Page is missing a meta description",
      field: "description",
    });
    score -= 20;
    recommendations.push("Add a compelling meta description");
  } else {
    const descLength = input.description.length;
    if (descLength < seoDefaults.descriptionMinLength) {
      issues.push({
        type: "short_description",
        severity: "warning",
        message: `Description is too short (${descLength} chars). Aim for 120-160 characters.`,
        field: "description",
      });
      score -= 10;
      recommendations.push(
        "Expand description to provide more context for searchers"
      );
    }
    if (descLength > seoDefaults.descriptionMaxLength + 20) {
      issues.push({
        type: "long_description",
        severity: "info",
        message: `Description is long (${descLength} chars). May be truncated in SERPs.`,
        field: "description",
      });
      score -= 3;
    }
  }

  // Content/word count validation
  const wordCount =
    input.wordCount || countWords(input.content || "");
  if (wordCount < contentQuality.minWordCount) {
    issues.push({
      type: "thin_content",
      severity: "error",
      message: `Content is thin (${wordCount} words). Minimum recommended: ${contentQuality.minWordCount} words.`,
      field: "content",
    });
    score -= 30;
    recommendations.push(
      `Add more unique, valuable content. Current: ${wordCount} words, Target: ${contentQuality.minWordCount}+ words`
    );
  }

  // H1 validation
  if (input.h1 !== undefined && input.h1.trim().length === 0) {
    issues.push({
      type: "missing_h1",
      severity: "warning",
      message: "Page is missing an H1 heading",
      field: "h1",
    });
    score -= 10;
    recommendations.push("Add a clear H1 heading that includes target keywords");
  }

  // FAQ validation (for FAQ pages)
  if (input.faqs !== undefined) {
    if (input.faqs.length === 0) {
      issues.push({
        type: "missing_faq",
        severity: "error",
        message: "FAQ page has no FAQ items",
        field: "faqs",
      });
      score -= 25;
    } else if (input.faqs.length < contentQuality.minFaqCount) {
      issues.push({
        type: "insufficient_faq",
        severity: "warning",
        message: `FAQ page has only ${input.faqs.length} items. Recommend at least ${contentQuality.minFaqCount}.`,
        field: "faqs",
      });
      score -= 10;
      recommendations.push(
        `Add more FAQ items. Current: ${input.faqs.length}, Target: ${contentQuality.minFaqCount}+`
      );
    }

    // Check for quality FAQs
    const lowQualityFaqs = input.faqs.filter(
      (faq) => faq.answer.length < 50 || faq.question.length < 10
    );
    if (lowQualityFaqs.length > 0) {
      issues.push({
        type: "thin_content",
        severity: "warning",
        message: `${lowQualityFaqs.length} FAQ items have very short answers`,
        field: "faqs",
      });
      score -= 5 * lowQualityFaqs.length;
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine indexability
  const hasBlockingErrors = issues.some(
    (issue) =>
      issue.severity === "error" &&
      (issue.type === "thin_content" || issue.type === "missing_content")
  );

  return {
    isValid: score >= 50,
    score,
    issues,
    recommendations,
    shouldIndex: !hasBlockingErrors && score >= 40,
    shouldNoFollow: score < 30,
  };
}

/**
 * Validates filter page content to prevent thin filter combinations
 */
export function validateFilterPage(
  entityCount: number,
  hasDescription: boolean,
  hasContent: boolean
): ContentValidationResult {
  const issues: ContentIssue[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Empty or near-empty filter results
  if (entityCount === 0) {
    issues.push({
      type: "missing_content",
      severity: "error",
      message: "Filter page has no results",
    });
    score -= 50;
    recommendations.push("Consider noindexing empty filter pages");
  } else if (entityCount < 3) {
    issues.push({
      type: "thin_content",
      severity: "warning",
      message: `Filter page has only ${entityCount} results`,
    });
    score -= 20;
    recommendations.push(
      "Consider consolidating with parent filter or adding more content"
    );
  }

  if (!hasDescription) {
    issues.push({
      type: "missing_description",
      severity: "warning",
      message: "Filter page lacks a unique description",
    });
    score -= 15;
  }

  if (!hasContent) {
    issues.push({
      type: "thin_content",
      severity: "warning",
      message: "Filter page has no descriptive content",
    });
    score -= 15;
    recommendations.push(
      "Add introductory content explaining the filter criteria"
    );
  }

  score = Math.max(0, Math.min(100, score));

  return {
    isValid: score >= 50,
    score,
    issues,
    recommendations,
    shouldIndex: entityCount >= 3 && score >= 40,
    shouldNoFollow: entityCount < 3 || score < 30,
  };
}

/**
 * Count words in HTML content (strips tags)
 */
export function countWords(htmlContent: string): number {
  if (!htmlContent) return 0;

  // Strip HTML tags
  const textContent = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!textContent) return 0;

  return textContent.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Extract text content from HTML for analysis
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if content is likely to be duplicate/boilerplate
 */
export function detectBoilerplate(
  content: string,
  templatePatterns: RegExp[]
): { isBoilerplate: boolean; matchedPatterns: number } {
  if (!content) return { isBoilerplate: false, matchedPatterns: 0 };

  const matchedPatterns = templatePatterns.filter((pattern) =>
    pattern.test(content)
  ).length;

  const boilerplateRatio = matchedPatterns / templatePatterns.length;

  return {
    isBoilerplate: boilerplateRatio > 0.7,
    matchedPatterns,
  };
}

/**
 * Generate robots meta directive based on content quality
 */
export function getRobotsDirective(
  validation: ContentValidationResult
): string {
  if (!validation.shouldIndex) {
    return validation.shouldNoFollow ? "noindex, nofollow" : "noindex, follow";
  }
  return "index, follow";
}
