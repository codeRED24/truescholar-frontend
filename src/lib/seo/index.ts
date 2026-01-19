/**
 * TrueScholar SEO Library
 * Centralized SEO utilities for programmatic page generation
 *
 * @example
 * // In page.tsx generateMetadata function
 * import { generatePageMetadata } from '@/lib/seo';
 *
 * export async function generateMetadata({ params }) {
 *   const college = await getCollegeById(params.id);
 *   return generatePageMetadata({
 *     type: 'college',
 *     data: college,
 *   });
 * }
 *
 * @example
 * // In page component for JSON-LD
 * import { generatePageSchema, JsonLd } from '@/lib/seo';
 *
 * export default function Page({ data }) {
 *   const schema = generatePageSchema({
 *     type: 'college',
 *     data: college,
 *   });
 *
 *   return (
 *     <>
 *       <JsonLd data={schema} />
 *       <PageContent />
 *     </>
 *   );
 * }
 */

// Configuration
export {
  siteConfig,
  seoDefaults,
  contentQuality,
  revalidationTimes,
  collegeTabConfig,
  examSiloConfig,
  publisherInfo,
  contactInfo,
  socialLinks,
  getBaseUrl,
  buildCanonicalUrl,
  getCurrentYear,
  formatTitleWithSuffix,
  truncateText,
  sanitizeForMeta,
  generateCollegeKeywords,
  generateExamKeywords,
} from "./config";
export type { EntityType } from "./config";

// Metadata Generation
export {
  generatePageMetadata,
  generateErrorMetadata,
  generateListingMetadata,
  mergeMetadata,
} from "./metadata/generator";
export type { MetadataInput, StaticPageData } from "./metadata/generator";

// Metadata Templates
export {
  collegeMetadataTemplates,
  examMetadataTemplates,
  articleMetadataTemplates,
  authorMetadataTemplates,
  filterMetadataTemplates,
  getCollegeTabTemplate,
  getExamSiloTemplate,
} from "./metadata/templates";
export type {
  CollegeData,
  CollegeTabData,
  ExamData,
  ExamSiloData,
  ArticleData,
  AuthorData,
  FilterPageData,
  MetadataTemplate,
} from "./metadata/templates";

// Content Validation
export {
  validateContent,
  validateFilterPage,
  countWords,
  extractTextFromHtml,
  detectBoilerplate,
  getRobotsDirective,
} from "./metadata/validators";
export type {
  ContentValidationResult,
  ContentIssue,
  ContentIssueType,
  ContentInput,
} from "./metadata/validators";

// Schema Generation
export {
  generatePageSchema,
  generateGlobalSchema,
  mergeSchemas,
  addToSchema,
} from "./schema/generator";
export type {
  SchemaInput,
  GeneratedSchema,
  BreadcrumbItem,
  CollegeSchemaInput,
  ArticleSchemaInput,
  FAQItem,
  ExamSchemaInput,
} from "./schema/generator";

// Schema Type Builders (for advanced use cases)
export {
  buildBreadcrumbSchema,
  buildCollegeBreadcrumbs,
  buildExamBreadcrumbs,
  buildArticleBreadcrumbs,
  buildFilterBreadcrumbs,
  commonBreadcrumbs,
} from "./schema/types/breadcrumb";

export {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildPublisherSchema,
} from "./schema/types/organization";

export { buildCollegeSchema, buildEducationalOrgSchema } from "./schema/types/college";

export {
  buildArticleSchema,
  buildNewsArticleSchema,
  buildArticleWebPageSchema,
} from "./schema/types/article";

export {
  buildFAQSchema,
  parseFAQsFromHtml,
  validateFAQForSchema,
  prepareAndBuildFAQSchema,
} from "./schema/types/faq";

export {
  buildExamEventSchema,
  buildExamDatesSchemas,
  buildExamCourseSchema,
} from "./schema/types/exam";

export { buildCourseSchema, buildProgramSchema } from "./schema/types/course";

export { buildEventSchema, buildCollegeDatesSchemas } from "./schema/types/event";

export {
  buildWebPageSchema,
  buildCollectionPageSchema,
  buildSearchResultsSchema,
  buildItemListSchema,
} from "./schema/types/webpage";

// JSON-LD Component
export { JsonLd, JsonLdMultiple, withJsonLd } from "./schema/JsonLd";
export type { JsonLdProps } from "./schema/JsonLd";

// Internal Linking - Breadcrumbs
export {
  buildCollegeBreadcrumbTrail,
  buildExamBreadcrumbTrail,
  buildArticleBreadcrumbTrail,
  buildFilterBreadcrumbTrail,
  buildAuthorBreadcrumbTrail,
  buildStaticBreadcrumbTrail,
  buildCollegeNewsBreadcrumbTrail,
  buildExamNewsBreadcrumbTrail,
  absolutizeBreadcrumbs,
} from "./linking/breadcrumbs";

// Internal Linking - URL Builders
export {
  cleanSlug,
  buildCollegeUrl,
  buildExamUrl,
  buildArticleUrl,
} from "./linking/url-builders";

// Internal Linking - Hub and Spoke
export {
  getCollegeHubSpokeLinks,
  getExamHubSpokeLinks,
  generateContextualLinks,
  getRelatedSuggestions,
} from "./linking/hub-spoke";
export type {
  HubLink,
  SpokeLink,
  EntityLink,
  HubSpokeLinks,
} from "./linking/hub-spoke";

// Internal Linking - Related Content
export {
  findRelatedColleges,
  findRelatedExams,
  findRelatedArticles,
  getCrossEntityLinks,
} from "./linking/related";
export type {
  RelatedItem,
  RelatedContentResult,
} from "./linking/related";

// Sitemap Generation
export {
  generateSitemapXml,
  generateSitemapIndexXml,
  isValidSitemapUrl,
  calculatePriority,
  calculateChangeFreq,
  formatLastmod,
  buildCollegeSitemapEntry,
  buildExamSitemapEntry,
  buildArticleSitemapEntry,
  getStaticSitemapEntries,
} from "./sitemap/generator";
export type { SitemapUrl, SitemapGeneratorOptions } from "./sitemap/generator";

export {
  chunkSitemap,
  needsChunking,
  calculateChunkCount,
  getChunkPage,
  getSitemapChunkFilename,
  streamSitemapUrls,
  processSitemapInBatches,
} from "./sitemap/chunker";
export type { ChunkedSitemap } from "./sitemap/chunker";

export {
  calculateDynamicPriority,
  rankUrlsByPriority,
  groupByPriorityTier,
  suggestChangeFreq,
  getOptimalSitemapOrder,
} from "./sitemap/priority";
export type { PriorityFactors } from "./sitemap/priority";

// Anti-Cannibalization
export {
  getFilterCanonicalStrategy,
  buildFilterUrl,
  findMoreSpecificCanonical,
  detectCannibalization,
  generateUniqueFilterKeywords,
} from "./cannibalization/canonical-strategy";
export type { FilterParams, CanonicalResult } from "./cannibalization/canonical-strategy";

export {
  detectKeywordCannibalization,
  suggestAlternativeKeywords,
} from "./cannibalization/detector";
export type {
  PageKeywordData,
  CannibalizationReport,
  CannibalizationConflict,
} from "./cannibalization/detector";
