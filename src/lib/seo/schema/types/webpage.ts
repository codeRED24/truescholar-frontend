/**
 * WebPage Schema Builder
 * Generates WebPage and related structured data
 */

import { siteConfig, getCurrentYear } from "../../config";

export interface WebPageSchemaInput {
  name: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  primaryImageOfPage?: string;
  pageType?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "FAQPage"
    | "CollectionPage"
    | "ItemPage"
    | "ProfilePage"
    | "SearchResultsPage";
}

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": string;
  name: string;
  description?: string;
  url: string;
  isPartOf: {
    "@type": "WebSite";
    "@id": string;
    name: string;
    url: string;
  };
  datePublished?: string;
  dateModified?: string;
  primaryImageOfPage?: {
    "@type": "ImageObject";
    url: string;
  };
  breadcrumb?: {
    "@type": "BreadcrumbList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      name: string;
      item: string;
    }>;
  };
}

/**
 * Build WebPage schema
 */
export function buildWebPageSchema(input: WebPageSchemaInput): WebPageSchema {
  const schema: WebPageSchema = {
    "@context": "https://schema.org",
    "@type": input.pageType || "WebPage",
    name: input.name,
    url: input.url.startsWith("http")
      ? input.url
      : `${siteConfig.baseUrl}${input.url}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.baseUrl}/#website`,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
  };

  if (input.description) {
    schema.description = input.description;
  }

  if (input.datePublished) {
    schema.datePublished = input.datePublished;
  }

  if (input.dateModified) {
    schema.dateModified = input.dateModified;
  }

  if (input.primaryImageOfPage) {
    schema.primaryImageOfPage = {
      "@type": "ImageObject",
      url: input.primaryImageOfPage,
    };
  }

  // Inline breadcrumb if provided
  if (input.breadcrumbs && input.breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: input.breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith("http")
          ? crumb.url
          : `${siteConfig.baseUrl}${crumb.url}`,
      })),
    };
  }

  return schema;
}

/**
 * Build CollectionPage schema for listing pages
 */
export function buildCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  itemCount?: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: url.startsWith("http") ? url : `${siteConfig.baseUrl}${url}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.baseUrl}/#website`,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    } as any,
    ...(itemCount !== undefined && {
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: itemCount,
      },
    }),
  };
}

/**
 * Build SearchResultsPage schema
 */
export function buildSearchResultsSchema(
  query: string,
  resultCount: number,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: `Search results for "${query}"`,
    description: `Found ${resultCount} results for "${query}" on ${siteConfig.name}`,
    url: url.startsWith("http") ? url : `${siteConfig.baseUrl}${url}`,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.baseUrl}/#website`,
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    } as any,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: resultCount,
      itemListElement: [], // Would be populated with actual results
    },
  };
}

/**
 * Build ItemList schema for list pages
 */
export function buildItemListSchema(
  items: Array<{ name: string; url: string; position?: number }>,
  listName?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position || index + 1,
      name: item.name,
      url: item.url.startsWith("http")
        ? item.url
        : `${siteConfig.baseUrl}${item.url}`,
    })),
  };
}
