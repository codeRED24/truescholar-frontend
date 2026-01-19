/**
 * Unified Schema Generator
 * Central function for generating JSON-LD structured data
 */

import { EntityType } from "../config";
import {
  BreadcrumbItem,
  buildBreadcrumbSchema,
  buildCollegeBreadcrumbs,
  buildExamBreadcrumbs,
  buildArticleBreadcrumbs,
  buildFilterBreadcrumbs,
} from "./types/breadcrumb";
import { buildCollegeSchema, CollegeSchemaInput } from "./types/college";
import { buildArticleSchema, ArticleSchemaInput } from "./types/article";
import { buildFAQSchema, FAQItem } from "./types/faq";
import {
  buildExamEventSchema,
  buildExamDatesSchemas,
  ExamSchemaInput,
} from "./types/exam";
import { buildEventSchema, buildCollegeDatesSchemas } from "./types/event";
import { buildWebPageSchema } from "./types/webpage";
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "./types/organization";

// Re-export types for convenience
export type { BreadcrumbItem } from "./types/breadcrumb";
export type { CollegeSchemaInput } from "./types/college";
export type { ArticleSchemaInput } from "./types/article";
export type { FAQItem } from "./types/faq";
export type { ExamSchemaInput } from "./types/exam";

// Schema input types
export type SchemaInput =
  | { type: "college"; data: CollegeSchemaInput; breadcrumbs?: BreadcrumbItem[] }
  | {
      type: "college-tab";
      data: CollegeSchemaInput;
      tab: string;
      tabLabel: string;
      tabPath: string;
      breadcrumbs?: BreadcrumbItem[];
      faqs?: FAQItem[];
      dates?: Array<{
        event: string;
        start_date?: string;
        end_date?: string;
        is_confirmed?: boolean;
      }>;
    }
  | { type: "exam"; data: ExamSchemaInput; breadcrumbs?: BreadcrumbItem[] }
  | {
      type: "exam-silo";
      data: ExamSchemaInput;
      silo: string;
      siloLabel: string;
      siloPath: string;
      breadcrumbs?: BreadcrumbItem[];
      faqs?: FAQItem[];
    }
  | { type: "article"; data: ArticleSchemaInput; breadcrumbs?: BreadcrumbItem[] }
  | {
      type: "filter";
      entityType: "college" | "exam";
      stream?: string;
      city?: string;
      state?: string;
      resultCount?: number;
    }
  | { type: "static"; pageName: string; pageUrl: string; breadcrumbs?: BreadcrumbItem[] };

export interface GeneratedSchema {
  "@context": "https://schema.org";
  "@graph": object[];
}

/**
 * Generate unified schema with @graph structure
 * This creates a single JSON-LD block with all relevant schemas
 */
export function generatePageSchema(input: SchemaInput): GeneratedSchema {
  const graph: object[] = [];

  switch (input.type) {
    case "college": {
      const collegeSlug = `${input.data.slug.replace(/(?:-\d+)+$/, "")}-${input.data.college_id}`;

      // Add College schema
      graph.push(buildCollegeSchema(input.data));

      // Add breadcrumbs
      const breadcrumbs =
        input.breadcrumbs ||
        buildCollegeBreadcrumbs(input.data.college_name, collegeSlug);
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      break;
    }

    case "college-tab": {
      const collegeSlug = `${input.data.slug.replace(/(?:-\d+)+$/, "")}-${input.data.college_id}`;

      // Add College schema
      graph.push(buildCollegeSchema(input.data));

      // Add breadcrumbs
      const breadcrumbs =
        input.breadcrumbs ||
        buildCollegeBreadcrumbs(
          input.data.college_name,
          collegeSlug,
          input.tabLabel,
          input.tabPath
        );
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      // Add FAQ schema if available
      if (input.faqs && input.faqs.length > 0) {
        const faqSchema = buildFAQSchema(input.faqs);
        if (faqSchema) {
          graph.push(faqSchema);
        }
      }

      // Add Event schemas for dates
      if (input.dates && input.dates.length > 0) {
        const eventSchemas = buildCollegeDatesSchemas(
          input.data.college_name,
          input.dates,
          `/colleges/${collegeSlug}`
        );
        graph.push(...eventSchemas);
      }

      break;
    }

    case "exam": {
      const examSlug = `${input.data.slug.replace(/-\d+$/, "")}-${input.data.exam_id}`;

      // Add Event schema for exam
      const eventSchema = buildExamEventSchema(input.data);
      if (eventSchema) {
        graph.push(eventSchema);
      }

      // Add breadcrumbs
      const breadcrumbs =
        input.breadcrumbs ||
        buildExamBreadcrumbs(input.data.exam_name, examSlug);
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      // Add exam date events
      const dateSchemas = buildExamDatesSchemas(input.data);
      if (dateSchemas.length > 0) {
        graph.push(...dateSchemas);
      }

      break;
    }

    case "exam-silo": {
      const examSlug = `${input.data.slug.replace(/-\d+$/, "")}-${input.data.exam_id}`;

      // Add Event schema for exam
      const eventSchema = buildExamEventSchema(input.data);
      if (eventSchema) {
        graph.push(eventSchema);
      }

      // Add breadcrumbs
      const breadcrumbs =
        input.breadcrumbs ||
        buildExamBreadcrumbs(
          input.data.exam_name,
          examSlug,
          input.siloLabel,
          input.siloPath
        );
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      // Add FAQ schema if available
      if (input.faqs && input.faqs.length > 0) {
        const faqSchema = buildFAQSchema(input.faqs);
        if (faqSchema) {
          graph.push(faqSchema);
        }
      }

      break;
    }

    case "article": {
      const articleSlug = `${input.data.slug.replace(/\s+/g, "-").toLowerCase()}-${input.data.article_id}`;

      // Add Article schema
      graph.push(buildArticleSchema(input.data));

      // Add WebPage schema
      graph.push(
        buildWebPageSchema({
          name: input.data.title,
          description: input.data.description,
          url: `/articles/${articleSlug}`,
          datePublished: input.data.created_at,
          dateModified: input.data.updated_at,
          pageType: "ItemPage",
        })
      );

      // Add breadcrumbs
      const breadcrumbs =
        input.breadcrumbs ||
        buildArticleBreadcrumbs(
          input.data.title,
          articleSlug,
          input.data.category
        );
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      break;
    }

    case "filter": {
      // Add breadcrumbs for filter pages
      const breadcrumbs = buildFilterBreadcrumbs(
        input.entityType === "college" ? "colleges" : "exams",
        input.stream,
        input.city,
        input.state
      );
      graph.push(buildBreadcrumbSchema(breadcrumbs));

      break;
    }

    case "static": {
      // Add WebPage schema
      graph.push(
        buildWebPageSchema({
          name: input.pageName,
          url: input.pageUrl,
          pageType: "WebPage",
        })
      );

      // Add breadcrumbs if provided
      if (input.breadcrumbs && input.breadcrumbs.length > 0) {
        graph.push(buildBreadcrumbSchema(input.breadcrumbs));
      }

      break;
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Generate global schemas for root layout
 * These should be included on every page
 */
export function generateGlobalSchema(): GeneratedSchema {
  return {
    "@context": "https://schema.org",
    "@graph": [buildOrganizationSchema(), buildWebSiteSchema(true)],
  };
}

/**
 * Merge multiple schema objects into one @graph
 */
export function mergeSchemas(...schemas: (GeneratedSchema | object)[]): GeneratedSchema {
  const graph: object[] = [];

  for (const schema of schemas) {
    if ("@graph" in schema && Array.isArray((schema as GeneratedSchema)["@graph"])) {
      graph.push(...(schema as GeneratedSchema)["@graph"]);
    } else {
      graph.push(schema);
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Add a single schema item to an existing schema
 */
export function addToSchema(
  baseSchema: GeneratedSchema,
  ...items: object[]
): GeneratedSchema {
  return {
    "@context": "https://schema.org",
    "@graph": [...baseSchema["@graph"], ...items],
  };
}
