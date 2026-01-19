/**
 * College Schema Builder
 * Generates CollegeOrUniversity and EducationalOrganization structured data
 */

import { siteConfig } from "../../config";

export interface CollegeSchemaInput {
  college_id: number;
  college_name: string;
  slug: string;
  logo_img?: string;
  city?: string;
  state?: string;
  location?: string;
  college_website?: string;
  college_email?: string;
  college_phone?: string;
  established_year?: number;
  college_type?: string;
  accreditation?: string;
  nirf_ranking?: number;
  rating?: number;
}

export interface CollegeSchema {
  "@context": "https://schema.org";
  "@type": "CollegeOrUniversity";
  name: string;
  url: string;
  logo?: string;
  image?: string;
  description?: string;
  address?: {
    "@type": "PostalAddress";
    addressLocality?: string;
    addressRegion?: string;
    addressCountry: string;
    streetAddress?: string;
  };
  telephone?: string;
  email?: string;
  sameAs?: string;
  foundingDate?: string;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
}

/**
 * Build CollegeOrUniversity schema
 */
export function buildCollegeSchema(input: CollegeSchemaInput): CollegeSchema {
  const collegeSlug = `${input.slug.replace(/(?:-\d+)+$/, "")}-${input.college_id}`;
  const collegeUrl = `${siteConfig.baseUrl}/colleges/${collegeSlug}`;

  const schema: CollegeSchema = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: input.college_name,
    url: collegeUrl,
  };

  if (input.logo_img) {
    schema.logo = input.logo_img;
    schema.image = input.logo_img;
  }

  if (input.city || input.state || input.location) {
    schema.address = {
      "@type": "PostalAddress",
      addressCountry: "IN",
    };

    if (input.city) {
      schema.address.addressLocality = input.city;
    }

    if (input.state) {
      schema.address.addressRegion = input.state;
    }

    if (input.location) {
      schema.address.streetAddress = input.location;
    }
  }

  if (input.college_phone) {
    schema.telephone = input.college_phone;
  }

  if (input.college_email) {
    schema.email = input.college_email;
  }

  if (input.college_website) {
    schema.sameAs = input.college_website;
  }

  if (input.established_year) {
    schema.foundingDate = input.established_year.toString();
  }

  if (input.rating && input.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.rating,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Build educational organization schema for college pages
 */
export function buildEducationalOrgSchema(input: CollegeSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: input.college_name,
    url: `${siteConfig.baseUrl}/colleges/${input.slug.replace(/(?:-\d+)+$/, "")}-${input.college_id}`,
    logo: input.logo_img,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressRegion: input.state,
      addressCountry: "IN",
    },
  };
}
