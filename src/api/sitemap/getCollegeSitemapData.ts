"use server";

import { CollegeSitemapResponse } from "../@types/sitemap";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCollegeSitemapData = async (
  page: number = 1,
  limit: number = 1
): Promise<CollegeSitemapResponse> => {
  const url = `${API_URL}/college-info/sitemap?page=${page}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching college sitemap data:", error);
    return { colleges: [], total: 0 };
  }
};
