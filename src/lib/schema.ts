/**
 * Generates breadcrumb structured data for SEO
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbData {
  "@context": string;
  "@type": string;
  itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generates breadcrumb schema data
 * @param breadcrumbs Array of breadcrumb items with name and url
 * @returns BreadcrumbData object for JSON-LD
 */
export function generateBreadcrumbSchema(
  breadcrumbs: BreadcrumbItem[]
): BreadcrumbData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://truescholar.in";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith("http") ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Predefined breadcrumb configurations for common pages
 */
export const breadcrumbConfigs = {
  home: [{ name: "Home", url: "/" }],

  aboutUs: [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about-us" },
  ],

  contactUs: [
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact-us" },
  ],

  privacyPolicy: [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ],

  termsConditions: [
    { name: "Home", url: "/" },
    { name: "Terms and Conditions", url: "/terms-and-conditions" },
  ],

  colleges: [
    { name: "Home", url: "/" },
    { name: "Colleges", url: "/colleges" },
  ],

  exams: [
    { name: "Home", url: "/" },
    { name: "Exams", url: "/exams" },
  ],

  articles: [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ],

  authors: [
    { name: "Home", url: "/" },
    { name: "Authors", url: "/authors" },
  ],

  compareColleges: [
    { name: "Home", url: "/" },
    { name: "Compare Colleges", url: "/compare-colleges" },
  ],
};

/**
 * Helper function to create dynamic breadcrumbs
 */
export function createDynamicBreadcrumb(
  baseCrumbs: BreadcrumbItem[],
  dynamicName: string,
  dynamicUrl?: string
): BreadcrumbItem[] {
  return [
    ...baseCrumbs,
    {
      name: dynamicName,
      url: dynamicUrl || "#", // Use # for dynamic segments that don't have a static URL
    },
  ];
}
