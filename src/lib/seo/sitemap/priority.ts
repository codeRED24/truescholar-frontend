/**
 * Sitemap Priority Calculator
 * Calculates dynamic priority based on traffic and importance
 */

import { collegeTabConfig, examSiloConfig } from "../config";

export interface PriorityFactors {
  // Entity-level factors
  entityType: "college" | "exam" | "article" | "author" | "filter" | "static";
  ranking?: number;
  pageViews?: number;
  conversionRate?: number;
  
  // Content factors
  hasRichContent?: boolean;
  hasImages?: boolean;
  hasFaqs?: boolean;
  hasNews?: boolean;
  
  // Temporal factors
  isRecent?: boolean; // Updated within last 30 days
  isTimeSensitive?: boolean; // Exam dates, admission deadlines
  
  // Page-level factors
  isMainPage?: boolean;
  tab?: string;
  silo?: string;
}

/**
 * Calculate dynamic priority score (0.0 - 1.0)
 */
export function calculateDynamicPriority(factors: PriorityFactors): number {
  let priority = getBasePriority(factors.entityType);

  // Entity importance adjustments
  if (factors.ranking !== undefined) {
    if (factors.ranking <= 10) {
      priority += 0.2;
    } else if (factors.ranking <= 50) {
      priority += 0.1;
    } else if (factors.ranking <= 100) {
      priority += 0.05;
    }
  }

  // Traffic-based adjustments
  if (factors.pageViews !== undefined) {
    if (factors.pageViews > 10000) {
      priority += 0.15;
    } else if (factors.pageViews > 1000) {
      priority += 0.1;
    } else if (factors.pageViews > 100) {
      priority += 0.05;
    }
  }

  // Content richness adjustments
  if (factors.hasRichContent) priority += 0.05;
  if (factors.hasImages) priority += 0.02;
  if (factors.hasFaqs) priority += 0.03;
  if (factors.hasNews) priority += 0.05;

  // Temporal adjustments
  if (factors.isRecent) priority += 0.05;
  if (factors.isTimeSensitive) priority += 0.1;

  // Page-level adjustments
  if (factors.isMainPage) {
    priority = Math.max(priority, 0.8);
  }

  // Tab/Silo adjustments
  if (factors.tab) {
    const tabPriority = getTabPriority(factors.tab);
    priority = (priority + tabPriority) / 2;
  }

  if (factors.silo) {
    const siloPriority = getSiloPriority(factors.silo);
    priority = (priority + siloPriority) / 2;
  }

  // Normalize to 0.1 - 1.0 range
  return Math.min(1.0, Math.max(0.1, Math.round(priority * 10) / 10));
}

/**
 * Get base priority for entity type
 */
function getBasePriority(entityType: PriorityFactors["entityType"]): number {
  switch (entityType) {
    case "static":
      return 0.8;
    case "college":
      return 0.7;
    case "exam":
      return 0.7;
    case "article":
      return 0.6;
    case "filter":
      return 0.5;
    case "author":
      return 0.4;
    default:
      return 0.5;
  }
}

/**
 * Get priority for college tab
 */
function getTabPriority(tab: string): number {
  const config = collegeTabConfig[tab as keyof typeof collegeTabConfig];
  return config?.priority || 0.5;
}

/**
 * Get priority for exam silo
 */
function getSiloPriority(silo: string): number {
  const config = examSiloConfig[silo as keyof typeof examSiloConfig];
  return config?.priority || 0.5;
}

/**
 * Rank URLs by priority for optimal crawl efficiency
 */
export function rankUrlsByPriority<T extends { priority?: number }>(
  urls: T[]
): T[] {
  return [...urls].sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
}

/**
 * Group URLs by priority tier
 */
export function groupByPriorityTier<T extends { priority?: number }>(
  urls: T[]
): {
  high: T[];     // 0.8 - 1.0
  medium: T[];   // 0.5 - 0.7
  low: T[];      // 0.1 - 0.4
} {
  return {
    high: urls.filter((u) => (u.priority || 0.5) >= 0.8),
    medium: urls.filter((u) => (u.priority || 0.5) >= 0.5 && (u.priority || 0.5) < 0.8),
    low: urls.filter((u) => (u.priority || 0.5) < 0.5),
  };
}

/**
 * Suggest change frequency based on factors
 */
export function suggestChangeFreq(
  factors: Partial<PriorityFactors>
): "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" {
  if (factors.isTimeSensitive) {
    return "daily";
  }

  if (factors.hasNews) {
    return "daily";
  }

  if (factors.isRecent) {
    return "weekly";
  }

  switch (factors.entityType) {
    case "static":
      return "monthly";
    case "college":
      return "weekly";
    case "exam":
      return "weekly";
    case "article":
      return "monthly";
    case "author":
      return "monthly";
    case "filter":
      return "weekly";
    default:
      return "weekly";
  }
}

/**
 * Get optimal sitemap ordering for a category
 * High priority URLs first for better crawl efficiency
 */
export function getOptimalSitemapOrder<T extends { priority?: number; url: string }>(
  urls: T[]
): T[] {
  return [...urls].sort((a, b) => {
    // Sort by priority descending
    const priorityDiff = (b.priority || 0.5) - (a.priority || 0.5);
    if (priorityDiff !== 0) return priorityDiff;

    // Then alphabetically by URL for consistency
    return a.url.localeCompare(b.url);
  });
}
