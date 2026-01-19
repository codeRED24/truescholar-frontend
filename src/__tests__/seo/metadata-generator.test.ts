/**
 * Metadata Generator Tests
 * Tests for the unified metadata generation system
 */

import { describe, it, expect } from "vitest";
import {
  generatePageMetadata,
  generateErrorMetadata,
  generateListingMetadata,
} from "@/lib/seo/metadata/generator";

describe("generatePageMetadata", () => {
  describe("college type", () => {
    it("should generate valid metadata for college page", () => {
      const metadata = generatePageMetadata({
        type: "college",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
          city: "New Delhi",
          state: "Delhi",
        },
      });

      expect(metadata.title).toContain("IIT Delhi");
      expect(metadata.description).toContain("IIT Delhi");
      expect(metadata.alternates?.canonical).toContain("/colleges/iit-delhi-123");
      expect(metadata.openGraph?.title).toBeDefined();
      expect(metadata.twitter).toBeDefined();
    });

    it("should use custom SEO data when provided", () => {
      const metadata = generatePageMetadata({
        type: "college",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
          seo: {
            title: "Custom Title for IIT Delhi",
            meta_desc: "Custom description for SEO",
          },
        },
      });

      expect(metadata.title).toContain("Custom Title");
      expect(metadata.description).toContain("Custom description");
    });
  });

  describe("college-tab type", () => {
    it("should generate valid metadata for college tab page", () => {
      const metadata = generatePageMetadata({
        type: "college-tab",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
          tab: "cutoffs",
        },
      });

      expect(metadata.title).toContain("IIT Delhi");
      expect(metadata.title).toContain("Cutoff");
      expect(metadata.alternates?.canonical).toContain("/colleges/iit-delhi-123/cutoffs");
    });

    it("should handle all tab types", () => {
      const tabs = ["cutoffs", "courses", "fees", "placements", "faq", "rankings"] as const;
      
      tabs.forEach((tab) => {
        const metadata = generatePageMetadata({
          type: "college-tab",
          data: {
            college_id: 123,
            college_name: "Test College",
            slug: "test-college",
            tab,
          },
        });

        expect(metadata.title).toBeDefined();
        expect(metadata.alternates?.canonical).toContain(tab);
      });
    });
  });

  describe("exam type", () => {
    it("should generate valid metadata for exam page", () => {
      const metadata = generatePageMetadata({
        type: "exam",
        data: {
          exam_id: 456,
          exam_name: "JEE Main",
          slug: "jee-main",
        },
      });

      expect(metadata.title).toContain("JEE Main");
      expect(metadata.alternates?.canonical).toContain("/exams/jee-main-456");
    });
  });

  describe("exam-silo type", () => {
    it("should generate valid metadata for exam silo page", () => {
      const metadata = generatePageMetadata({
        type: "exam-silo",
        data: {
          exam_id: 456,
          exam_name: "JEE Main",
          slug: "jee-main",
          silo: "exam-syllabus",
        },
      });

      expect(metadata.title).toContain("JEE Main");
      expect(metadata.title).toContain("Syllabus");
      expect(metadata.alternates?.canonical).toContain("/exam-syllabus");
    });
  });

  describe("article type", () => {
    it("should generate valid metadata for article page", () => {
      const metadata = generatePageMetadata({
        type: "article",
        data: {
          article_id: 789,
          title: "Top Engineering Colleges 2026",
          slug: "top-engineering-colleges-2026",
          meta_desc: "Comprehensive guide to top engineering colleges",
          author: { author_id: 1, author_name: "Test Author" },
        },
      });

      expect(metadata.title).toContain("Top Engineering Colleges");
      expect(metadata.description).toContain("Comprehensive guide");
      expect(metadata.openGraph).toBeDefined();
    });

    it("should include article-specific OpenGraph data", () => {
      const metadata = generatePageMetadata({
        type: "article",
        data: {
          article_id: 789,
          title: "Test Article",
          slug: "test-article",
          author: { author_id: 1, author_name: "John Doe" },
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:00:00Z",
        },
      });

      expect(metadata.openGraph).toBeDefined();
      // @ts-expect-error - OpenGraph article properties
      expect(metadata.openGraph?.publishedTime).toBeDefined();
    });
  });

  describe("filter type", () => {
    it("should generate valid metadata for filter page", () => {
      const metadata = generatePageMetadata({
        type: "filter",
        data: {
          entityType: "college",
          stream: { id: 1, name: "Engineering" },
          city: { id: 2, name: "Delhi" },
          resultCount: 150,
        },
      });

      expect(metadata.title).toContain("Engineering");
      expect(metadata.title).toContain("Colleges");
      expect(metadata.title).toContain("Delhi");
    });

    it("should handle filter without location", () => {
      const metadata = generatePageMetadata({
        type: "filter",
        data: {
          entityType: "college",
          stream: { id: 1, name: "Engineering" },
          resultCount: 500,
        },
      });

      expect(metadata.title).toContain("Engineering");
      expect(metadata.title).toContain("India");
    });
  });

  describe("static type", () => {
    it("should generate valid metadata for static page", () => {
      const metadata = generatePageMetadata({
        type: "static",
        data: {
          title: "About Us",
          description: "Learn about TrueScholar",
          canonicalPath: "/about",
        },
      });

      expect(metadata.title).toContain("About Us");
      expect(metadata.description).toBe("Learn about TrueScholar");
      expect(metadata.alternates?.canonical).toContain("/about");
    });

    it("should respect noIndex flag", () => {
      const metadata = generatePageMetadata({
        type: "static",
        data: {
          title: "Internal Page",
          description: "Not for indexing",
          canonicalPath: "/internal",
          noIndex: true,
        },
      });

      expect(metadata.robots).toEqual({ index: false, follow: true });
    });
  });
});

describe("generateErrorMetadata", () => {
  it("should generate not-found metadata", () => {
    const metadata = generateErrorMetadata("not-found", "college");
    
    expect(metadata.title).toContain("Not Found");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("should generate error metadata", () => {
    const metadata = generateErrorMetadata("error", "exam");
    
    expect(metadata.title).toContain("Error");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("should work without entity type", () => {
    const metadata = generateErrorMetadata("not-found");
    
    expect(metadata.title).toContain("Not Found");
    expect(metadata.description).toContain("page");
  });
});

describe("generateListingMetadata", () => {
  it("should generate colleges listing metadata", () => {
    const metadata = generateListingMetadata("colleges");
    
    expect(metadata.title).toContain("Colleges");
    expect(metadata.title).toContain("India");
    expect(metadata.alternates?.canonical).toContain("/colleges");
  });

  it("should generate exams listing metadata", () => {
    const metadata = generateListingMetadata("exams");
    
    expect(metadata.title).toContain("Exams");
    expect(metadata.alternates?.canonical).toContain("/exams");
  });

  it("should generate articles listing metadata", () => {
    const metadata = generateListingMetadata("articles");
    
    expect(metadata.title).toContain("Articles");
    expect(metadata.alternates?.canonical).toContain("/articles");
  });

  it("should apply stream filter", () => {
    const metadata = generateListingMetadata("colleges", {
      stream: "Engineering",
    });
    
    expect(metadata.title).toContain("Engineering");
  });

  it("should apply city filter", () => {
    const metadata = generateListingMetadata("colleges", {
      city: "Mumbai",
    });
    
    expect(metadata.title).toContain("Mumbai");
  });
});
