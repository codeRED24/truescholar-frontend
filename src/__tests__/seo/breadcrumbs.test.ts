/**
 * Breadcrumbs Tests
 * Tests for breadcrumb trail generation
 */

import { describe, it, expect } from "vitest";
import {
  buildCollegeBreadcrumbTrail,
  buildExamBreadcrumbTrail,
  buildArticleBreadcrumbTrail,
  buildFilterBreadcrumbTrail,
  buildAuthorBreadcrumbTrail,
  buildStaticBreadcrumbTrail,
  absolutizeBreadcrumbs,
} from "@/lib/seo/linking/breadcrumbs";

describe("buildCollegeBreadcrumbTrail", () => {
  it("should build breadcrumbs for college main page", () => {
    const breadcrumbs = buildCollegeBreadcrumbTrail("IIT Delhi", "iit-delhi-123");

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({ name: "Colleges", href: "/colleges" });
    expect(breadcrumbs[2]).toEqual({
      name: "IIT Delhi",
      href: "/colleges/iit-delhi-123",
      current: true,
    });
  });

  it("should build breadcrumbs for college tab page", () => {
    const breadcrumbs = buildCollegeBreadcrumbTrail(
      "IIT Delhi",
      "iit-delhi-123",
      "cutoffs"
    );

    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[2].current).toBe(false);
    expect(breadcrumbs[3]).toEqual({
      name: "Cutoffs",
      href: "/colleges/iit-delhi-123/cutoffs",
      current: true,
    });
  });

  it("should handle info tab without extra breadcrumb", () => {
    const breadcrumbs = buildCollegeBreadcrumbTrail(
      "IIT Delhi",
      "iit-delhi-123",
      "info"
    );

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[2].current).toBe(true);
  });
});

describe("buildExamBreadcrumbTrail", () => {
  it("should build breadcrumbs for exam main page", () => {
    const breadcrumbs = buildExamBreadcrumbTrail("JEE Main", "jee-main-456");

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({ name: "Exams", href: "/exams" });
    expect(breadcrumbs[2]).toEqual({
      name: "JEE Main",
      href: "/exams/jee-main-456",
      current: true,
    });
  });

  it("should build breadcrumbs for exam silo page", () => {
    const breadcrumbs = buildExamBreadcrumbTrail(
      "JEE Main",
      "jee-main-456",
      "exam-syllabus"
    );

    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[3].name).toBe("Syllabus");
    expect(breadcrumbs[3].current).toBe(true);
  });
});

describe("buildArticleBreadcrumbTrail", () => {
  it("should build breadcrumbs for article page", () => {
    const breadcrumbs = buildArticleBreadcrumbTrail(
      "Top Engineering Colleges 2026",
      "top-engineering-colleges-2026-789"
    );

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({ name: "Articles", href: "/articles" });
    expect(breadcrumbs[2].current).toBe(true);
  });

  it("should NOT include category even when provided (as per requirements)", () => {
    const breadcrumbs = buildArticleBreadcrumbTrail(
      "Top Colleges",
      "top-colleges-123",
      "Education"
    );

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[1].name).toBe("Articles");
    expect(breadcrumbs[2].name).toBe("Top Colleges");
  });

  it("should truncate long article titles", () => {
    const longTitle = "This is a very long article title that should be truncated for better display in breadcrumbs";
    const breadcrumbs = buildArticleBreadcrumbTrail(longTitle, "article-123");

    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    expect(lastBreadcrumb.name.length).toBeLessThanOrEqual(43); // 40 + "..."
  });
});

describe("buildFilterBreadcrumbTrail", () => {
  it("should build breadcrumbs for base filter page", () => {
    const breadcrumbs = buildFilterBreadcrumbTrail("colleges", {});

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({
      name: "Colleges",
      href: "/colleges",
      current: true,
    });
  });

  it("should build breadcrumbs with stream filter", () => {
    const breadcrumbs = buildFilterBreadcrumbTrail("colleges", {
      stream: { name: "Engineering", slug: "engineering" },
    });

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[2].name).toContain("Engineering");
  });

  it("should build breadcrumbs with city filter", () => {
    const breadcrumbs = buildFilterBreadcrumbTrail("colleges", {
      city: { name: "Mumbai", slug: "mumbai" },
    });

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[2].name).toContain("Mumbai");
  });

  it("should build breadcrumbs with stream and city", () => {
    const breadcrumbs = buildFilterBreadcrumbTrail("colleges", {
      stream: { name: "Engineering", slug: "engineering" },
      city: { name: "Mumbai", slug: "mumbai" },
    });

    expect(breadcrumbs).toHaveLength(4);
    expect(breadcrumbs[2].name).toContain("Engineering");
    expect(breadcrumbs[3].name).toContain("Mumbai");
  });

  it("should work for exams entity type", () => {
    const breadcrumbs = buildFilterBreadcrumbTrail("exams", {
      stream: { name: "Medical", slug: "medical" },
    });

    expect(breadcrumbs[1].name).toBe("Exams");
    expect(breadcrumbs[2].name).toContain("Medical");
    expect(breadcrumbs[2].name).toContain("Exams");
  });
});

describe("buildAuthorBreadcrumbTrail", () => {
  it("should build breadcrumbs for author page", () => {
    const breadcrumbs = buildAuthorBreadcrumbTrail("John Doe", "john-doe-123");

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({ name: "Authors", href: "/authors" });
    expect(breadcrumbs[2]).toEqual({
      name: "John Doe",
      href: "/authors/john-doe-123",
      current: true,
    });
  });
});

describe("buildStaticBreadcrumbTrail", () => {
  it("should build breadcrumbs for static page", () => {
    const breadcrumbs = buildStaticBreadcrumbTrail("About Us", "/about");

    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs[0]).toEqual({ name: "Home", href: "/" });
    expect(breadcrumbs[1]).toEqual({
      name: "About Us",
      href: "/about",
      current: true,
    });
  });
});

describe("absolutizeBreadcrumbs", () => {
  it("should convert relative URLs to absolute", () => {
    const relative = [
      { name: "Home", href: "/" },
      { name: "Colleges", href: "/colleges" },
    ];

    const absolute = absolutizeBreadcrumbs(relative);

    expect(absolute[0].href).toBe("https://www.truescholar.in/");
    expect(absolute[1].href).toBe("https://www.truescholar.in/colleges");
  });

  it("should preserve already absolute URLs", () => {
    const mixed = [
      { name: "Home", href: "https://www.truescholar.in/" },
      { name: "Test", href: "/test" },
    ];

    const absolute = absolutizeBreadcrumbs(mixed);

    expect(absolute[0].href).toBe("https://www.truescholar.in/");
    expect(absolute[1].href).toBe("https://www.truescholar.in/test");
  });
});
