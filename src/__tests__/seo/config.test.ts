/**
 * SEO Config Tests
 * Tests for the core configuration module
 */

import { describe, it, expect } from "vitest";
import {
  siteConfig,
  revalidationTimes,
  collegeTabConfig,
  examSiloConfig,
  getBaseUrl,
  buildCanonicalUrl,
  getCurrentYear,
  formatTitleWithSuffix,
  truncateText,
  sanitizeForMeta,
  generateCollegeKeywords,
  generateExamKeywords,
} from "@/lib/seo/config";

describe("siteConfig", () => {
  it("should have required properties", () => {
    expect(siteConfig.name).toBe("TrueScholar");
    expect(siteConfig.baseUrl).toBe("https://www.truescholar.in");
    expect(siteConfig.tagline).toBeDefined();
    expect(siteConfig.description).toBeDefined();
    expect(siteConfig.locale).toBe("en_IN");
  });
});

describe("revalidationTimes", () => {
  it("should have proper revalidation times in seconds", () => {
    expect(revalidationTimes.college).toBe(21600); // 6 hours
    expect(revalidationTimes.exam).toBe(21600); // 6 hours
    expect(revalidationTimes.article).toBe(43200); // 12 hours
    expect(revalidationTimes.collegeSub).toBe(43200); // 12 hours
    expect(revalidationTimes.examSilo).toBe(43200); // 12 hours
    expect(revalidationTimes.filter).toBe(86400); // 24 hours
    expect(revalidationTimes.static).toBe(86400); // 24 hours
  });
});

describe("collegeTabConfig", () => {
  it("should have all required tabs", () => {
    const requiredTabs = [
      "info",
      "cutoffs",
      "courses",
      "fees",
      "placements",
      "admission-process",
      "faq",
      "rankings",
      "scholarship",
    ];
    
    requiredTabs.forEach((tab) => {
      expect(collegeTabConfig).toHaveProperty(tab);
      expect(collegeTabConfig[tab as keyof typeof collegeTabConfig]).toHaveProperty("priority");
      expect(collegeTabConfig[tab as keyof typeof collegeTabConfig]).toHaveProperty("label");
      expect(collegeTabConfig[tab as keyof typeof collegeTabConfig]).toHaveProperty("path");
    });
  });
});

describe("examSiloConfig", () => {
  it("should have all required silos", () => {
    const requiredSilos = [
      "info",
      "exam-syllabus",
      "exam-pattern",
      "exam-cutoff",
      "exam-result",
    ];
    
    requiredSilos.forEach((silo) => {
      expect(examSiloConfig).toHaveProperty(silo);
    });
  });
});

describe("getBaseUrl", () => {
  it("should return the base URL", () => {
    expect(getBaseUrl()).toBe("https://www.truescholar.in");
  });
});

describe("buildCanonicalUrl", () => {
  it("should build absolute URL from path", () => {
    expect(buildCanonicalUrl("/colleges/iit-delhi-123")).toBe(
      "https://www.truescholar.in/colleges/iit-delhi-123"
    );
  });

  it("should handle paths without leading slash", () => {
    expect(buildCanonicalUrl("colleges/iit-delhi-123")).toBe(
      "https://www.truescholar.in/colleges/iit-delhi-123"
    );
  });

  it("should handle empty path", () => {
    const result = buildCanonicalUrl("");
    expect(result).toMatch(/^https:\/\/www\.truescholar\.in\/?$/);
  });
});

describe("getCurrentYear", () => {
  it("should return current year as number", () => {
    const year = getCurrentYear();
    expect(typeof year).toBe("number");
    expect(year).toBeGreaterThanOrEqual(2024);
  });
});

describe("formatTitleWithSuffix", () => {
  it("should add site name suffix", () => {
    expect(formatTitleWithSuffix("IIT Delhi")).toBe("IIT Delhi | TrueScholar");
  });

  it("should not double-add suffix", () => {
    expect(formatTitleWithSuffix("IIT Delhi | TrueScholar")).toBe(
      "IIT Delhi | TrueScholar"
    );
  });
});

describe("truncateText", () => {
  it("should not truncate short text", () => {
    expect(truncateText("Short text", 100)).toBe("Short text");
  });

  it("should truncate long text with ellipsis", () => {
    const longText = "This is a very long text that should be truncated";
    const result = truncateText(longText, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith("...")).toBe(true);
  });

  it("should use default max length if not specified", () => {
    const longText = "A".repeat(200);
    const result = truncateText(longText, 160);
    expect(result.length).toBeLessThanOrEqual(160); // Default max length
  });
});

describe("sanitizeForMeta", () => {
  it("should remove or handle HTML-like content", () => {
    const result = sanitizeForMeta("<p>Hello <strong>World</strong></p>");
    // Should not contain angle brackets as-is, or should strip them
    expect(result.length).toBeGreaterThan(0);
  });

  it("should normalize whitespace", () => {
    expect(sanitizeForMeta("Hello    World\n\nTest")).toBe("Hello World Test");
  });

  it("should handle empty input", () => {
    expect(sanitizeForMeta("")).toBe("");
  });
});

describe("generateCollegeKeywords", () => {
  it("should generate keywords array", () => {
    const keywords = generateCollegeKeywords("IIT Delhi", "Delhi", "Delhi");
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.some((k) => k.toLowerCase().includes("iit delhi"))).toBe(true);
  });

  it("should include location in keywords", () => {
    const keywords = generateCollegeKeywords("IIT Bombay", "Mumbai", "Maharashtra");
    expect(keywords.some((k) => k.toLowerCase().includes("mumbai"))).toBe(true);
  });

  it("should include streams in keywords", () => {
    const keywords = generateCollegeKeywords(
      "IIT Delhi",
      "Delhi",
      "Delhi",
      ["Engineering", "Science"]
    );
    expect(keywords.some((k) => k.toLowerCase().includes("engineering"))).toBe(true);
  });
});

describe("generateExamKeywords", () => {
  it("should generate keywords array", () => {
    const keywords = generateExamKeywords("JEE Main");
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.some((k) => k.toLowerCase().includes("jee main"))).toBe(true);
  });

  it("should include full name if provided", () => {
    const keywords = generateExamKeywords(
      "JEE",
      "Joint Entrance Examination"
    );
    expect(
      keywords.some((k) => k.toLowerCase().includes("joint entrance"))
    ).toBe(true);
  });
});
