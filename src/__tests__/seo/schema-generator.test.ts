/**
 * Schema Generator Tests
 * Tests for the unified JSON-LD schema generation system
 */

import { describe, it, expect } from "vitest";
import {
  generatePageSchema,
  generateGlobalSchema,
  mergeSchemas,
  addToSchema,
} from "@/lib/seo/schema/generator";

describe("generatePageSchema", () => {
  describe("college type", () => {
    it("should generate valid schema with @graph structure", () => {
      const schema = generatePageSchema({
        type: "college",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
          city: "New Delhi",
          state: "Delhi",
        },
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(Array.isArray(schema["@graph"])).toBe(true);
      expect(schema["@graph"].length).toBeGreaterThan(0);
    });

    it("should include College and BreadcrumbList schemas", () => {
      const schema = generatePageSchema({
        type: "college",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
        },
      });

      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("CollegeOrUniversity");
      expect(types).toContain("BreadcrumbList");
    });
  });

  describe("college-tab type", () => {
    it("should generate schema for college tab page", () => {
      const schema = generatePageSchema({
        type: "college-tab",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
        },
        tab: "cutoffs",
        tabLabel: "Cutoffs",
        tabPath: "/cutoffs",
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@graph"].length).toBeGreaterThan(0);
    });

    it("should include FAQ schema when FAQs provided", () => {
      const schema = generatePageSchema({
        type: "college-tab",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
        },
        tab: "faq",
        tabLabel: "FAQ",
        tabPath: "/faq",
        faqs: [
          { question: "What is the fee?", answer: "The fee is 2 lakhs per year." },
          { question: "What are the courses?", answer: "B.Tech, M.Tech, PhD" },
        ],
      });

      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("FAQPage");
    });

    it("should include Event schemas when dates provided", () => {
      const schema = generatePageSchema({
        type: "college-tab",
        data: {
          college_id: 123,
          college_name: "IIT Delhi",
          slug: "iit-delhi",
        },
        tab: "cutoffs",
        tabLabel: "Cutoffs",
        tabPath: "/cutoffs",
        dates: [
          { event: "Application Start", start_date: "2024-06-01" },
          { event: "Application End", end_date: "2024-07-15" },
        ],
      });

      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types.some((t: string) => t === "Event")).toBe(true);
    });
  });

  describe("exam type", () => {
    it("should generate valid exam schema", () => {
      const schema = generatePageSchema({
        type: "exam",
        data: {
          exam_id: 456,
          exam_name: "JEE Main",
          slug: "jee-main",
          exam_date: "2024-04-15",
        },
      });

      expect(schema["@context"]).toBe("https://schema.org");
      
      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("BreadcrumbList");
    });
  });

  describe("exam-silo type", () => {
    it("should generate valid exam silo schema", () => {
      const schema = generatePageSchema({
        type: "exam-silo",
        data: {
          exam_id: 456,
          exam_name: "JEE Main",
          slug: "jee-main",
        },
        silo: "exam-syllabus",
        siloLabel: "Syllabus",
        siloPath: "/exam-syllabus",
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@graph"].length).toBeGreaterThan(0);
    });
  });

  describe("article type", () => {
    it("should generate valid article schema", () => {
      const schema = generatePageSchema({
        type: "article",
        data: {
          article_id: 789,
          title: "Top Colleges 2026",
          slug: "top-colleges-2026",
          description: "Guide to top colleges",
          created_at: "2024-01-15",
          updated_at: "2024-01-20",
        },
      });

      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("BlogPosting");
      expect(types).toContain("BreadcrumbList");
    });

    it("should include author info when provided", () => {
      const schema = generatePageSchema({
        type: "article",
        data: {
          article_id: 789,
          title: "Test Article",
          slug: "test-article",
          author: {
            author_id: 1,
            author_name: "John Doe",
          },
        },
      });

      const articleSchema = schema["@graph"].find(
        (item: any) => item["@type"] === "BlogPosting"
      ) as any;
      expect(articleSchema?.author?.name).toBe("John Doe");
    });
  });

  describe("filter type", () => {
    it("should generate valid filter page schema", () => {
      const schema = generatePageSchema({
        type: "filter",
        entityType: "college",
        stream: "Engineering",
        city: "Delhi",
      });

      expect(schema["@context"]).toBe("https://schema.org");
      
      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("BreadcrumbList");
    });
  });

  describe("static type", () => {
    it("should generate valid static page schema", () => {
      const schema = generatePageSchema({
        type: "static",
        pageName: "About Us",
        pageUrl: "/about",
      });

      const types = schema["@graph"].map((item: any) => item["@type"]);
      expect(types).toContain("WebPage");
    });
  });
});

describe("generateGlobalSchema", () => {
  it("should generate Organization and WebSite schemas", () => {
    const schema = generateGlobalSchema();

    expect(schema["@context"]).toBe("https://schema.org");
    
    const types = schema["@graph"].map((item: any) => item["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
  });

  it("should include search action in WebSite schema", () => {
    const schema = generateGlobalSchema();
    
    const webSiteSchema = schema["@graph"].find(
      (item: any) => item["@type"] === "WebSite"
    ) as any;
    expect(webSiteSchema?.potentialAction).toBeDefined();
    expect(webSiteSchema?.potentialAction?.["@type"]).toBe("SearchAction");
  });
});

describe("mergeSchemas", () => {
  it("should merge multiple schema objects", () => {
    const schema1 = generatePageSchema({
      type: "static",
      pageName: "Test",
      pageUrl: "/test",
    });

    const customSchema = {
      "@type": "FAQPage",
      mainEntity: [],
    };

    const merged = mergeSchemas(schema1, customSchema);

    expect(merged["@graph"].length).toBeGreaterThan(schema1["@graph"].length);
  });

  it("should flatten nested @graph arrays", () => {
    const schema1 = { "@context": "https://schema.org", "@graph": [{ "@type": "A" }] };
    const schema2 = { "@context": "https://schema.org", "@graph": [{ "@type": "B" }] };

    const merged = mergeSchemas(schema1, schema2);

    expect(merged["@graph"]).toHaveLength(2);
    expect(merged["@graph"].map((i: any) => i["@type"])).toEqual(["A", "B"]);
  });
});

describe("addToSchema", () => {
  it("should add items to existing schema", () => {
    const baseSchema = generatePageSchema({
      type: "static",
      pageName: "Test",
      pageUrl: "/test",
    });

    const originalLength = baseSchema["@graph"].length;

    const extended = addToSchema(baseSchema, { "@type": "Event", name: "Test" });

    expect(extended["@graph"].length).toBe(originalLength + 1);
  });

  it("should add multiple items at once", () => {
    const baseSchema = { "@context": "https://schema.org" as const, "@graph": [] };

    const extended = addToSchema(
      baseSchema,
      { "@type": "A" },
      { "@type": "B" },
      { "@type": "C" }
    );

    expect(extended["@graph"]).toHaveLength(3);
  });
});
