/**
 * Course Schema Builder
 * Generates Course and Program structured data
 */

import { siteConfig } from "../../config";

export interface CourseSchemaInput {
  course_id?: number;
  course_name: string;
  course_full_name?: string;
  duration?: string;
  duration_years?: number;
  fee_min?: number;
  fee_max?: number;
  fee_currency?: string;
  eligibility?: string;
  mode?: string; // Full-time, Part-time, Online
  college?: {
    college_id: number;
    college_name: string;
    slug: string;
  };
  specializations?: string[];
}

export interface CourseSchema {
  "@context": "https://schema.org";
  "@type": "Course";
  name: string;
  description: string;
  provider: {
    "@type": "CollegeOrUniversity" | "Organization";
    name: string;
    url?: string;
  };
  timeRequired?: string;
  hasCourseInstance?: {
    "@type": "CourseInstance";
    courseMode: string;
    courseWorkload?: string;
  };
  offers?: {
    "@type": "Offer";
    price?: number;
    priceCurrency: string;
    priceSpecification?: {
      "@type": "PriceSpecification";
      price?: number;
      minPrice?: number;
      maxPrice?: number;
      priceCurrency: string;
    };
  };
  educationalCredentialAwarded?: string;
}

/**
 * Build Course schema
 */
export function buildCourseSchema(input: CourseSchemaInput): CourseSchema {
  const courseName = input.course_full_name || input.course_name;

  const schema: CourseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseName,
    description: `${courseName}${input.college ? ` at ${input.college.college_name}` : ""}${input.duration ? `. Duration: ${input.duration}` : ""}`,
    provider: input.college
      ? {
          "@type": "CollegeOrUniversity",
          name: input.college.college_name,
          url: `${siteConfig.baseUrl}/colleges/${input.college.slug.replace(/(?:-\d+)+$/, "")}-${input.college.college_id}`,
        }
      : {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.baseUrl,
        },
  };

  // Duration
  if (input.duration_years) {
    schema.timeRequired = `P${input.duration_years}Y`;
  } else if (input.duration) {
    schema.timeRequired = input.duration;
  }

  // Course instance
  if (input.mode) {
    schema.hasCourseInstance = {
      "@type": "CourseInstance",
      courseMode: mapCourseMode(input.mode),
    };
  }

  // Pricing
  if (input.fee_min || input.fee_max) {
    const currency = input.fee_currency || "INR";

    schema.offers = {
      "@type": "Offer",
      priceCurrency: currency,
    };

    if (input.fee_min && input.fee_max && input.fee_min !== input.fee_max) {
      schema.offers.priceSpecification = {
        "@type": "PriceSpecification",
        minPrice: input.fee_min,
        maxPrice: input.fee_max,
        priceCurrency: currency,
      };
    } else {
      schema.offers.price = input.fee_max || input.fee_min;
    }
  }

  // Credential
  if (courseName.includes("B.Tech") || courseName.includes("BTech")) {
    schema.educationalCredentialAwarded = "Bachelor of Technology";
  } else if (courseName.includes("MBA")) {
    schema.educationalCredentialAwarded = "Master of Business Administration";
  } else if (courseName.includes("MBBS")) {
    schema.educationalCredentialAwarded = "Bachelor of Medicine and Bachelor of Surgery";
  } else if (courseName.includes("M.Tech") || courseName.includes("MTech")) {
    schema.educationalCredentialAwarded = "Master of Technology";
  }

  return schema;
}

/**
 * Map course mode to Schema.org format
 */
function mapCourseMode(mode: string): string {
  const modeMap: Record<string, string> = {
    "full-time": "Full-time",
    fulltime: "Full-time",
    "part-time": "Part-time",
    parttime: "Part-time",
    online: "Online",
    distance: "Distance Learning",
    hybrid: "Blended",
  };

  return modeMap[mode.toLowerCase()] || mode;
}

/**
 * Build EducationalOccupationalProgram schema
 */
export function buildProgramSchema(input: CourseSchemaInput) {
  const courseName = input.course_full_name || input.course_name;

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: courseName,
    description: `${courseName} program${input.college ? ` offered by ${input.college.college_name}` : ""}`,
    provider: input.college
      ? {
          "@type": "CollegeOrUniversity",
          name: input.college.college_name,
        }
      : undefined,
    timeToComplete: input.duration_years ? `P${input.duration_years}Y` : undefined,
    programType: getProgramType(courseName),
    educationalCredentialAwarded: getCredentialType(courseName),
  };
}

/**
 * Determine program type from course name
 */
function getProgramType(courseName: string): string {
  if (/^(B\.|Bachelor|B\.Tech|BTech|BBA|BCA|BE)/i.test(courseName)) {
    return "Bachelor's degree";
  }
  if (/^(M\.|Master|M\.Tech|MTech|MBA|MCA|ME|MS)/i.test(courseName)) {
    return "Master's degree";
  }
  if (/^(Ph\.?D|Doctor)/i.test(courseName)) {
    return "Doctoral degree";
  }
  if (/^(Diploma|PG Diploma)/i.test(courseName)) {
    return "Diploma";
  }
  return "Degree";
}

/**
 * Determine credential type from course name
 */
function getCredentialType(courseName: string): string | undefined {
  const credentialMap: Record<string, string> = {
    "B.Tech": "Bachelor of Technology",
    BTech: "Bachelor of Technology",
    MBA: "Master of Business Administration",
    MBBS: "Bachelor of Medicine and Bachelor of Surgery",
    "M.Tech": "Master of Technology",
    MTech: "Master of Technology",
    BBA: "Bachelor of Business Administration",
    BCA: "Bachelor of Computer Applications",
    MCA: "Master of Computer Applications",
    "B.Sc": "Bachelor of Science",
    "M.Sc": "Master of Science",
    "B.Com": "Bachelor of Commerce",
    "M.Com": "Master of Commerce",
    "B.A": "Bachelor of Arts",
    "M.A": "Master of Arts",
    LLB: "Bachelor of Laws",
    LLM: "Master of Laws",
  };

  for (const [key, value] of Object.entries(credentialMap)) {
    if (courseName.includes(key)) {
      return value;
    }
  }

  return undefined;
}
