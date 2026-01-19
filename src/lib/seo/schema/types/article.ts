/**
 * Article Schema Builder
 * Generates Article, BlogPosting, and NewsArticle structured data
 */

import { siteConfig, publisherInfo } from "../../config";
import { buildPublisherSchema } from "./organization";

export interface ArticleSchemaInput {
  article_id: number;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  img1_url?: string;
  img2_url?: string;
  created_at?: string;
  updated_at?: string;
  author?: {
    author_id: number;
    author_name: string;
    image_url?: string;
  };
  category?: string;
  tags?: string[];
  word_count?: number;
}

export interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting" | "NewsArticle" | "Article";
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
    image?: string;
  };
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
      width: number;
      height: number;
    };
  };
  image?: {
    "@type": "ImageObject";
    url: string;
    width: number;
    height: number;
  };
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
  articleSection?: string;
  keywords?: string;
  wordCount?: number;
}

/**
 * Build BlogPosting schema for articles
 */
export function buildArticleSchema(
  input: ArticleSchemaInput,
  type: "BlogPosting" | "NewsArticle" | "Article" = "BlogPosting"
): ArticleSchema {
  const articleSlug = `${input.slug.replace(/\s+/g, "-").toLowerCase()}-${input.article_id}`;
  const articleUrl = `${siteConfig.baseUrl}/articles/${articleSlug}`;

  const schema: ArticleSchema = {
    "@context": "https://schema.org",
    "@type": type,
    headline: input.title,
    description: input.description || `Read ${input.title} on TrueScholar`,
    url: articleUrl,
    author: {
      "@type": "Person",
      name: input.author?.author_name || "TrueScholar",
    },
    publisher: buildPublisherSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  if (input.created_at) {
    schema.datePublished = input.created_at;
  }

  if (input.updated_at) {
    schema.dateModified = input.updated_at;
  } else if (input.created_at) {
    schema.dateModified = input.created_at;
  }

  if (input.author?.author_id) {
    schema.author.url = `${siteConfig.baseUrl}/authors/${input.author.author_name?.toLowerCase().replace(/\s+/g, "-")}-${input.author.author_id}`;
  }

  if (input.author?.image_url) {
    schema.author.image = input.author.image_url;
  }

  const imageUrl = input.img1_url || input.img2_url;
  if (imageUrl) {
    schema.image = {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    };
  }

  if (input.category) {
    schema.articleSection = input.category;
  }

  if (input.tags && input.tags.length > 0) {
    schema.keywords = input.tags.join(", ");
  }

  if (input.word_count) {
    schema.wordCount = input.word_count;
  }

  return schema;
}

/**
 * Build NewsArticle schema for news content
 */
export function buildNewsArticleSchema(input: ArticleSchemaInput): ArticleSchema {
  return buildArticleSchema(input, "NewsArticle");
}

/**
 * Build WebPage schema wrapper for article pages
 */
export function buildArticleWebPageSchema(input: ArticleSchemaInput) {
  const articleSlug = `${input.slug.replace(/\s+/g, "-").toLowerCase()}-${input.article_id}`;
  const articleUrl = `${siteConfig.baseUrl}/articles/${articleSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: articleUrl,
  };
}
