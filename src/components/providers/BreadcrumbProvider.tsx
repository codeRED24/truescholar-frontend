"use client";

import { usePathname } from "next/navigation";
import JsonLd from "@/lib/jsonld";
import {
  generateBreadcrumbSchema,
  breadcrumbConfigs,
  createDynamicBreadcrumb,
} from "@/lib/schema";

/**
 * Converts a slug string (e.g. "my-slug") to a human-readable name (e.g. "My Slug")
 */
function slugToName(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * BreadcrumbProvider automatically generates and renders breadcrumb schema
 * based on the current pathname
 */
export default function BreadcrumbProvider() {
  const pathname = usePathname();

  // Function to generate breadcrumbs based on pathname
  const generateBreadcrumbsForPath = () => {
    // Handle home page
    if (pathname === "/") {
      return breadcrumbConfigs.home;
    }

    // Handle static pages
    if (pathname === "/about-us") {
      return breadcrumbConfigs.aboutUs;
    }

    if (pathname === "/contact-us") {
      return breadcrumbConfigs.contactUs;
    }

    if (pathname === "/privacy-policy") {
      return breadcrumbConfigs.privacyPolicy;
    }

    if (pathname === "/terms-and-conditions") {
      return breadcrumbConfigs.termsConditions;
    }

    if (pathname === "/colleges") {
      return breadcrumbConfigs.colleges;
    }

    if (pathname === "/exams") {
      return breadcrumbConfigs.exams;
    }

    if (pathname === "/articles") {
      return breadcrumbConfigs.articles;
    }

    if (pathname === "/authors") {
      return breadcrumbConfigs.authors;
    }

    if (pathname === "/compare-colleges") {
      return breadcrumbConfigs.compareColleges;
    }

    if (pathname === "/review-form") {
      return createDynamicBreadcrumb(
        breadcrumbConfigs.home,
        "Review Form",
        "/review-form"
      );
    }

    // Handle dynamic college routes
    if (pathname.startsWith("/colleges/")) {
      const pathParts = pathname.split("/").filter(Boolean);

      if (pathParts.length >= 2) {
        const collegeSlug = pathParts[1];
        const collegeName = slugToName(collegeSlug);

        if (pathParts.length === 2) {
          // Base college page
          return createDynamicBreadcrumb(
            breadcrumbConfigs.colleges,
            collegeName,
            pathname
          );
        } else if (pathParts.length === 3) {
          // Sub-routes like /cutoffs, /fees, /news, etc.
          const subRoute = pathParts[2];
          const subRouteName = slugToName(subRoute);
          return createDynamicBreadcrumb(
            createDynamicBreadcrumb(
              breadcrumbConfigs.colleges,
              collegeName,
              `/colleges/${collegeSlug}`
            ),
            subRouteName,
            `/colleges/${collegeSlug}/${subRoute}`
          );
        } else if (pathParts.length >= 4) {
          // Individual items like /news/[news-id]
          const subRoute = pathParts[2];
          const itemSlug = pathParts[3];
          const subRouteName = slugToName(subRoute);
          const itemName = slugToName(itemSlug);

          return createDynamicBreadcrumb(
            createDynamicBreadcrumb(
              createDynamicBreadcrumb(
                breadcrumbConfigs.colleges,
                collegeName,
                `/colleges/${collegeSlug}`
              ),
              subRouteName,
              `/colleges/${collegeSlug}/${subRoute}`
            ),
            itemName,
            pathname
          );
        }
      }
    }

    // Handle dynamic article routes
    if (pathname.startsWith("/articles/")) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const articleSlug = pathParts[1];
        const articleName = slugToName(articleSlug);
        return createDynamicBreadcrumb(
          breadcrumbConfigs.articles,
          articleName,
          pathname
        );
      }
    }

    // Handle dynamic exam routes
    if (pathname.startsWith("/exams/")) {
      const pathParts = pathname.split("/").filter(Boolean);

      if (pathParts.length >= 2) {
        const examSlug = pathParts[1];
        const examName = slugToName(examSlug);

        if (pathParts.length === 2) {
          // Base exam page
          return createDynamicBreadcrumb(
            breadcrumbConfigs.exams,
            examName,
            pathname
          );
        } else {
          // Sub-routes like /news, /syllabus, etc.
          const subRoute = pathParts[2];
          const subRouteName =
            subRoute.charAt(0).toUpperCase() +
            subRoute.slice(1).replace(/-/g, " ");
          return createDynamicBreadcrumb(
            createDynamicBreadcrumb(
              breadcrumbConfigs.exams,
              examName,
              `/exams/${examSlug}`
            ),
            subRouteName,
            pathname
          );
        }
      }
    }

    // Handle dynamic author routes
    if (pathname.startsWith("/authors/")) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const authorSlug = pathParts[1];
        const authorName = slugToName(authorSlug);
        return createDynamicBreadcrumb(
          breadcrumbConfigs.authors,
          authorName,
          pathname
        );
      }
    }

    // Default fallback for unknown routes
    return breadcrumbConfigs.home;
  };

  const breadcrumbs = generateBreadcrumbsForPath();
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return <JsonLd data={breadcrumbSchema} />;
}
