"use server";

import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

// if (!API_URL || !BEARER_TOKEN) {
//   throw new Error(
//     "API URL or Bearer token is missing from environment variables."
//   );
// }

const fetchCollegeData = async (
  endpoint: string,
  college_id: number,
  schema = false,
  params = ""
) => {
  const baseUrl = `${API_URL}/college-info/${endpoint}/${college_id}`;
  const query = [];
  if (schema) query.push("schema=true");
  if (params) query.push(params.replace(/^&/, ""));
  const url = query.length > 0 ? `${baseUrl}?${query.join("&")}` : baseUrl;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 10800 },
    });
    if (!response.ok) {
      // return notFound();
    }
    return await response.json();
  } catch {
    // return notFound();
  }
};

export const getCollegeById = async (college_id: number, schema = false) => {
  return fetchCollegeData("info", college_id, schema);
};
export const getCollegeHighlightsById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("highlights", college_id, schema);
};
export const getCollegeScholarshipById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("scholarship", college_id, schema);
};
export const getCollegeNewsById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("news", college_id, schema);
};

export const getCollegeCourses = async (college_id: number) => {
  return fetchCollegeData("courses-and-fees", college_id);
};

export const getCollegeFees = async (college_id: number) => {
  return fetchCollegeData("fees", college_id);
};

export const getCollegeAdmissionProcess = async (college_id: number) => {
  return fetchCollegeData("admission-process", college_id);
};

export const getCollegePlacementProcess = async (college_id: number) => {
  return fetchCollegeData("placement-process", college_id);
};

export const getCollegeCutoffs = async (college_id: number) => {
  return fetchCollegeData("cutoffs", college_id);
};

export const getCollegeCutoffsData = async (
  college_id: number,
  schema = true
) => {
  return fetchCollegeData("cutoffs-data", college_id, schema);
};

export const getCollegeRankings = async (college_id: number) => {
  return fetchCollegeData("rankings", college_id);
};

export const getCollegeInfrastructure = async (college_id: number) => {
  return fetchCollegeData("infrastructure", college_id);
};

export const getCollegeFaq = async (college_id: number) => {
  return fetchCollegeData("faq", college_id);
};

export const getCollegeOthersById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("others", college_id, schema);
};

export const getCollegeEligibilityById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("eligibility", college_id, schema);
};

export const getCollegeResultsById = async (
  college_id: number,
  schema = false
) => {
  return fetchCollegeData("results", college_id, schema);
};

export const getCollegeFilters = async (
  college_id: number,
  params?: string
) => {
  return fetchCollegeData("courses-filters", college_id, false, params);
};

export const getCollegeCutoffsFilter = async (
  college_id: number,
  params?: string
) => {
  return fetchCollegeData("cutoffs-filters", college_id, false, params);
};

export const getCollegeFilteredCutoffs = async (
  college_id: number,
  params?: string
) => {
  return fetchCollegeData("filtered-cutoffs", college_id, false, params);
};
