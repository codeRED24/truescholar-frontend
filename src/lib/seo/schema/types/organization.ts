/**
 * Organization Schema Builder
 * Generates Organization and WebSite structured data
 */

import { siteConfig, socialLinks, contactInfo, publisherInfo } from "../../config";

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    contactType: string;
    availableLanguage: readonly string[];
    email?: string;
  };
}

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

/**
 * Build Organization schema for the site
 */
export function buildOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.baseUrl}/#organization`,
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    logo: siteConfig.logo,
    description: siteConfig.description,
    sameAs: [
      socialLinks.facebook,
      socialLinks.instagram,
      socialLinks.linkedin,
      socialLinks.twitter,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: contactInfo.type,
      availableLanguage: contactInfo.availableLanguage,
      email: contactInfo.email,
    },
  };
}

/**
 * Build WebSite schema with search action
 */
export function buildWebSiteSchema(includeSearchAction = true): WebSiteSchema {
  const schema: WebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.baseUrl}/#website`,
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    description: siteConfig.description,
  };

  if (includeSearchAction) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    };
  }

  return schema;
}

/**
 * Build Publisher schema for articles
 */
export function buildPublisherSchema() {
  return {
    "@type": "Organization" as const,
    "@id": `${siteConfig.baseUrl}/#organization`,
    name: publisherInfo.name,
    logo: {
      "@type": "ImageObject" as const,
      url: publisherInfo.logo.url,
      width: publisherInfo.logo.width,
      height: publisherInfo.logo.height,
    },
  };
}
