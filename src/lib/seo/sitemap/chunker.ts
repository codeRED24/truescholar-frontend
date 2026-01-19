/**
 * Sitemap Chunker
 * Handles splitting large sitemaps into multiple files
 */

import { SitemapUrl, generateSitemapXml, generateSitemapIndexXml } from "./generator";
import { siteConfig } from "../config";

// Google's limit is 50,000 URLs per sitemap and 50MB file size
const MAX_URLS_PER_SITEMAP = 45000; // Leave some margin
const MAX_FILE_SIZE_BYTES = 45 * 1024 * 1024; // 45MB to leave margin

export interface ChunkedSitemap {
  index: string;
  chunks: Array<{
    name: string;
    xml: string;
    urlCount: number;
  }>;
}

/**
 * Chunk a large sitemap into multiple files
 */
export function chunkSitemap(
  urls: SitemapUrl[],
  sitemapName: string
): ChunkedSitemap {
  const chunks: Array<{
    name: string;
    xml: string;
    urlCount: number;
  }> = [];

  // Split URLs into chunks
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunkUrls = urls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const chunkNumber = Math.floor(i / MAX_URLS_PER_SITEMAP) + 1;
    const chunkName = urls.length > MAX_URLS_PER_SITEMAP
      ? `${sitemapName}-${chunkNumber}`
      : sitemapName;

    chunks.push({
      name: chunkName,
      xml: generateSitemapXml(chunkUrls),
      urlCount: chunkUrls.length,
    });
  }

  // Generate index if we have multiple chunks
  const indexEntries = chunks.map((chunk) => ({
    url: `${siteConfig.baseUrl}/${chunk.name}.xml`,
    lastmod: new Date().toISOString().split("T")[0],
  }));

  return {
    index: generateSitemapIndexXml(indexEntries),
    chunks,
  };
}

/**
 * Determine if sitemap needs chunking
 */
export function needsChunking(urlCount: number): boolean {
  return urlCount > MAX_URLS_PER_SITEMAP;
}

/**
 * Calculate number of chunks needed
 */
export function calculateChunkCount(urlCount: number): number {
  return Math.ceil(urlCount / MAX_URLS_PER_SITEMAP);
}

/**
 * Get chunk for a specific page number
 */
export function getChunkPage(
  urls: SitemapUrl[],
  page: number
): { urls: SitemapUrl[]; totalPages: number; hasMore: boolean } {
  const totalPages = calculateChunkCount(urls.length);
  const start = (page - 1) * MAX_URLS_PER_SITEMAP;
  const end = start + MAX_URLS_PER_SITEMAP;

  return {
    urls: urls.slice(start, end),
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Generate sitemap filename for a chunk
 */
export function getSitemapChunkFilename(
  baseName: string,
  chunkNumber: number,
  totalChunks: number
): string {
  if (totalChunks === 1) {
    return `${baseName}.xml`;
  }
  return `${baseName}-${chunkNumber}.xml`;
}

/**
 * Stream sitemap URLs for memory-efficient processing
 * Use this for very large sitemaps (100K+ URLs)
 */
export async function* streamSitemapUrls(
  fetchPage: (page: number, limit: number) => Promise<{ urls: SitemapUrl[]; hasMore: boolean }>,
  pageSize = 1000
): AsyncGenerator<SitemapUrl> {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchPage(page, pageSize);
    
    for (const url of result.urls) {
      yield url;
    }

    hasMore = result.hasMore;
    page++;

    // Safety limit
    if (page > 1000) {
      console.warn("Sitemap stream exceeded 1000 pages, stopping");
      break;
    }
  }
}

/**
 * Batch process sitemap URLs
 */
export async function processSitemapInBatches<T>(
  items: T[],
  processor: (batch: T[]) => Promise<SitemapUrl[]>,
  batchSize = 100
): Promise<SitemapUrl[]> {
  const allUrls: SitemapUrl[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const urls = await processor(batch);
    allUrls.push(...urls);
  }

  return allUrls;
}
