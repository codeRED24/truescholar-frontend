# TrueScholar Frontend Routes and JSON-LD Schemas Documentation

## Overview

This document provides a comprehensive overview of all routes in the TrueScholar frontend application, categorizing them as static or dynamic, and documenting the JSON-LD schemas present on each page for SEO purposes.

## Global Schemas (Root Layout)

All pages inherit the following schemas from the root layout:

- **Organization Schema**: Defines TrueScholar as an organization
- **WebSite Schema**: Defines the website structure
- **BreadcrumbList Schema**: Automatically generated based on current page path

## Route Structure

### 1. Main Routes (/(main))

#### Static Routes

| Route                | Path                    | JSON-LD Schemas                |
| -------------------- | ----------------------- | ------------------------------ |
| Home                 | `/`                     | None (inherits global schemas) |
| About Us             | `/about-us`             | Inherits global schemas        |
| Contact Us           | `/contact-us`           | Inherits global schemas        |
| Privacy Policy       | `/privacy-policy`       | Inherits global schemas        |
| Terms and Conditions | `/terms-and-conditions` | Inherits global schemas        |
| Compare Colleges     | `/compare-colleges`     | Inherits global schemas        |
| Colleges Listing     | `/colleges`             | Inherits global schemas        |
| Exams Listing        | `/exams`                | Inherits global schemas        |
| Articles Listing     | `/articles`             | Inherits global schemas        |
| Authors Listing      | `/authors`              | Inherits global schemas        |

#### Dynamic Routes

##### College Routes (`/colleges/[slug-id]`)

| Sub-route            | Type    | JSON-LD Schemas                                  |
| -------------------- | ------- | ------------------------------------------------ |
| Base College Page    | Dynamic | Article, BreadcrumbList                          |
| `/cutoffs`           | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/rankings`          | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/highlights`        | Dynamic | CollegeOrUniversity, BreadcrumbList, Article     |
| `/news`              | Dynamic | CollegeOrUniversity, BreadcrumbList, NewsArticle |
| `/fees`              | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/scholarship`       | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/placements`        | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/courses`           | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/faq`               | Dynamic | CollegeOrUniversity, BreadcrumbList, FAQPage     |
| `/facilities`        | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/admission-process` | Dynamic | CollegeOrUniversity, BreadcrumbList              |
| `/news/[news-id]`    | Dynamic | CollegeOrUniversity, BreadcrumbList, NewsArticle |

##### Article Routes (`/articles/[slug-id]`)

| Route              | Type    | JSON-LD Schemas                 |
| ------------------ | ------- | ------------------------------- |
| Individual Article | Dynamic | Article (with @graph structure) |

##### Exam Routes (`/exams/[slug-id]`)

| Sub-route           | Type    | JSON-LD Schemas                           |
| ------------------- | ------- | ----------------------------------------- |
| Base Exam Page      | Dynamic | BreadcrumbList                            |
| `/[silos]`          | Dynamic | BreadcrumbList, Article                   |
| `/news`             | Dynamic | Organization, BreadcrumbList, NewsArticle |
| `/news/[news-slug]` | Dynamic | Organization, BreadcrumbList, NewsArticle |

##### Author Routes (`/authors/[authorId]`)

| Route          | Type    | JSON-LD Schemas         |
| -------------- | ------- | ----------------------- |
| Author Profile | Dynamic | Inherits global schemas |

##### Filter Routes (`/[filterSlug]`)

| Route            | Type    | JSON-LD Schemas         |
| ---------------- | ------- | ----------------------- |
| Filtered Content | Dynamic | Inherits global schemas |

### 2. Landing Pages (/(landings))

#### Static Routes

| Route                | Path                    | JSON-LD Schemas         |
| -------------------- | ----------------------- | ----------------------- |
| MBA Application Form | `/application-form-mba` | Inherits global schemas |

### 3. Landing Pages 2 (/(landings2))

#### Static Routes

| Route       | Path           | JSON-LD Schemas    |
| ----------- | -------------- | ------------------ |
| Review Form | `/review-form` | Home > Review Form |

### 4. API Routes

#### Static Routes

| Route          | Path                   | JSON-LD Schemas    |
| -------------- | ---------------------- | ------------------ |
| Contact Us API | `/api/post/contact-us` | N/A (API endpoint) |
| Lead Form API  | `/api/post/lead-form`  | N/A (API endpoint) |
| Newsletter API | `/api/post/newsletter` | N/A (API endpoint) |
| NPS Rating API | `/api/post/nps-rating` | N/A (API endpoint) |

## Schema Types Summary

### Most Common Schemas

1. **BreadcrumbList**: Used across most dynamic pages for navigation structure
2. **Article**: Used for content-rich pages (articles, college highlights, exam silos)
3. **NewsArticle**: Used for news-related content
4. **CollegeOrUniversity**: Used for college-specific pages
5. **Organization**: Global schema for site branding

### Schema Implementation Patterns

- **Global schemas**: Applied via root layout for consistent branding
- **Page-specific schemas**: Added dynamically based on content type
- **Structured data**: Uses @graph for complex relationships (e.g., articles)
- **Dynamic generation**: Schemas are generated server-side with actual content data

## SEO Recommendations

1. **Schema Consistency**: All pages should maintain the global Organization and WebSite schemas
2. **Dynamic Content**: Ensure dynamic routes properly generate relevant schemas based on content
3. **Rich Snippets**: College and article pages are well-positioned for rich snippets in search results
4. **News Content**: News-related pages have appropriate NewsArticle schemas for Google News

## Maintenance Notes

- **Schema Updates**: When adding new routes, ensure appropriate JSON-LD schemas are included
- **Data Validation**: Verify that dynamic schema data is correctly populated from API responses
- **Performance**: Schema generation should not impact page load times significantly

---

_Last Updated: August 25, 2025_
_Generated automatically from codebase analysis_
