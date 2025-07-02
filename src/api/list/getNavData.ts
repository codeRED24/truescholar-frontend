"use server";

import { HeaderProps } from "../@types/header-footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

const fetchData = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error: ${response.status} ${response.statusText}. ${errorText}`
      );
    }
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getNavData = async (): Promise<HeaderProps> => {
  if (!API_URL || !BEARER_TOKEN) {
    throw new Error(
      "API URL or Bearer token is missing from environment variables."
    );
  }

  const response = await fetchData(`${API_URL}/home-page/header-footer`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 },
  });

  try {
    const data: HeaderProps = await response.json();
    return data;
  } catch (err) {
    throw new Error("Failed to parse response as JSON.");
  }
};

export const fetchAndDestructureData = async () => {
  try {
    const navData = await getNavData();
    const {
      over_stream_section: overStreamData,
      cities_section: citiesData,
      stream_section: streamData,
      footer_colleges: footerColleges,
      university_section: universityData,
      exams_section: examSection,
      course_section: courseData,
    } = navData;
    return {
      overStreamData,
      citiesData,
      streamData,
      footerColleges,
      universityData,
      examSection,
      courseData,
    };
  } catch {
    throw new Error("Failed to fetch exams");
  }
};
