"use server";

import { ExamSitemapResponse } from "../@types/sitemap";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getExamSitemapData = async (
  page: number = 1,
  limit: number = 1000
): Promise<ExamSitemapResponse> => {
  const url = `${API_URL}/exams/sitemap?page=${page}&limit=${limit}`;
  console.log(`API_URL: ${API_URL}`);
  console.log(`Calling: ${url}`);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      //   next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch exam sitemap data: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exam sitemap data:", error);
    return { exams: [], total: 0 };
  }
};
