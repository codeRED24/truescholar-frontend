/**
 * Exam Schema Builder
 * Generates Event and Course structured data for exams
 */

import { siteConfig, getCurrentYear } from "../../config";

export interface ExamSchemaInput {
  exam_id: number;
  exam_name: string;
  exam_full_name?: string;
  slug: string;
  exam_description?: string;
  logo_img?: string;
  conducting_body?: string;
  exam_mode?: string;
  exam_level?: string;
  streams?: string[];
  exam_dates?: Array<{
    event: string;
    start_date?: string;
    end_date?: string;
    is_confirmed?: boolean;
  }>;
  application_start_date?: string;
  application_end_date?: string;
  exam_date?: string;
  result_date?: string;
}

export interface ExamEventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  url: string;
  startDate?: string;
  endDate?: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location?: {
    "@type": "Place" | "VirtualLocation";
    name: string;
    address?: {
      "@type": "PostalAddress";
      addressCountry: string;
    };
    url?: string;
  };
  organizer: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  image?: string;
}

/**
 * Build Event schema for exam
 */
export function buildExamEventSchema(input: ExamSchemaInput): ExamEventSchema | null {
  const examSlug = `${input.slug.replace(/-\d+$/, "")}-${input.exam_id}`;
  const examUrl = `${siteConfig.baseUrl}/exams/${examSlug}`;
  const examName = input.exam_full_name || input.exam_name;
  const year = getCurrentYear();

  // Need at least an exam date to create Event schema
  const examDate = input.exam_date || input.application_start_date;

  const schema: ExamEventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${examName} ${year}`,
    description:
      input.exam_description ||
      `${examName} entrance examination for ${year}`,
    url: examUrl,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      input.exam_mode?.toLowerCase() === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: input.conducting_body || siteConfig.name,
      url: examUrl,
    },
  };

  if (examDate) {
    schema.startDate = examDate;
  }

  if (input.exam_mode?.toLowerCase() === "online") {
    schema.location = {
      "@type": "VirtualLocation",
      name: "Online Examination",
      url: examUrl,
    };
  } else {
    schema.location = {
      "@type": "Place",
      name: "Examination Centers across India",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    };
  }

  if (input.logo_img) {
    schema.image = input.logo_img;
  }

  return schema;
}

/**
 * Build multiple Event schemas for exam dates
 */
export function buildExamDatesSchemas(
  input: ExamSchemaInput
): ExamEventSchema[] {
  if (!input.exam_dates || input.exam_dates.length === 0) {
    // Try to create from main dates
    const mainEvents: ExamEventSchema[] = [];

    if (input.application_start_date) {
      mainEvents.push({
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${input.exam_name} Application Start`,
        description: `Application window opens for ${input.exam_name}`,
        url: `${siteConfig.baseUrl}/exams/${input.slug.replace(/-\d+$/, "")}-${input.exam_id}`,
        startDate: input.application_start_date,
        endDate: input.application_end_date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: {
          "@type": "VirtualLocation",
          name: "Online Application Portal",
        },
        organizer: {
          "@type": "Organization",
          name: input.conducting_body || siteConfig.name,
          url: siteConfig.baseUrl,
        },
      });
    }

    return mainEvents;
  }

  const examSlug = `${input.slug.replace(/-\d+$/, "")}-${input.exam_id}`;
  const examUrl = `${siteConfig.baseUrl}/exams/${examSlug}`;

  return input.exam_dates.map((date) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${input.exam_name} - ${date.event}`,
    description: `${date.event} for ${input.exam_name}`,
    url: examUrl,
    startDate: date.start_date,
    endDate: date.end_date,
    eventStatus: date.is_confirmed
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventPostponed",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    organizer: {
      "@type": "Organization",
      name: input.conducting_body || siteConfig.name,
      url: siteConfig.baseUrl,
    },
  }));
}

/**
 * Build Course schema for exam preparation
 */
export function buildExamCourseSchema(input: ExamSchemaInput) {
  const examSlug = `${input.slug.replace(/-\d+$/, "")}-${input.exam_id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `${input.exam_name} Preparation Guide`,
    description:
      input.exam_description ||
      `Complete preparation guide for ${input.exam_name} including syllabus, exam pattern, and study materials.`,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    url: `${siteConfig.baseUrl}/exams/${examSlug}`,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "Self-paced",
    },
  };
}
