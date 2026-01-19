/**
 * FAQ Schema Builder
 * Generates FAQPage structured data
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

/**
 * Build FAQPage schema from FAQ items
 */
export function buildFAQSchema(faqs: FAQItem[]): FAQSchema | null {
  // Don't generate schema for empty FAQs
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Filter out empty/invalid FAQs
  const validFaqs = faqs.filter(
    (faq) =>
      faq.question &&
      faq.question.trim().length > 0 &&
      faq.answer &&
      faq.answer.trim().length > 0
  );

  if (validFaqs.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((faq) => ({
      "@type": "Question",
      name: sanitizeFAQText(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: sanitizeFAQText(faq.answer),
      },
    })),
  };
}

/**
 * Parse FAQs from HTML content
 * Looks for patterns like Q: ... A: ... or numbered lists
 */
export function parseFAQsFromHtml(html: string): FAQItem[] {
  if (!html) return [];

  const faqs: FAQItem[] = [];

  // Try to find FAQ patterns in HTML
  // Pattern 1: Look for h3/h4 followed by p tags
  const headingPattern =
    /<h[3-4][^>]*>(.*?)<\/h[3-4]>\s*<p[^>]*>(.*?)<\/p>/gi;
  let match;

  while ((match = headingPattern.exec(html)) !== null) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);

    if (question && answer && question.length > 5 && answer.length > 10) {
      // Check if it looks like a question
      if (
        question.includes("?") ||
        question.toLowerCase().startsWith("what") ||
        question.toLowerCase().startsWith("how") ||
        question.toLowerCase().startsWith("when") ||
        question.toLowerCase().startsWith("where") ||
        question.toLowerCase().startsWith("why") ||
        question.toLowerCase().startsWith("can") ||
        question.toLowerCase().startsWith("is") ||
        question.toLowerCase().startsWith("do")
      ) {
        faqs.push({ question, answer });
      }
    }
  }

  // Pattern 2: Look for dt/dd pairs (definition lists)
  const dlPattern = /<dt[^>]*>(.*?)<\/dt>\s*<dd[^>]*>(.*?)<\/dd>/gi;
  while ((match = dlPattern.exec(html)) !== null) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);

    if (question && answer && question.length > 5 && answer.length > 10) {
      faqs.push({ question, answer });
    }
  }

  // Pattern 3: Look for "Q:" and "A:" patterns
  const qaPattern = /Q[:.]\s*(.*?)\s*A[:.]\s*(.*?)(?=Q[:.]\s*|$)/gi;
  while ((match = qaPattern.exec(html)) !== null) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);

    if (question && answer && question.length > 5 && answer.length > 10) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitize FAQ text for schema
 */
function sanitizeFAQText(text: string): string {
  return text
    .replace(/[\n\r\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate FAQ quality for schema inclusion
 */
export function validateFAQForSchema(faq: FAQItem): boolean {
  // Minimum lengths
  if (faq.question.length < 10 || faq.answer.length < 20) {
    return false;
  }

  // Question should end with ? or be a clear question
  const isQuestion =
    faq.question.includes("?") ||
    /^(what|how|when|where|why|can|is|do|does|will|should|are|has|have)/i.test(
      faq.question
    );

  if (!isQuestion) {
    return false;
  }

  return true;
}

/**
 * Filter and validate FAQs before building schema
 */
export function prepareAndBuildFAQSchema(faqs: FAQItem[]): FAQSchema | null {
  const validFaqs = faqs.filter(validateFAQForSchema);

  if (validFaqs.length < 3) {
    // Google prefers at least 3 FAQs for rich results
    return null;
  }

  return buildFAQSchema(validFaqs);
}
