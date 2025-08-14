import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch individual news data by news ID.
 * @param {number} newsId - The news ID.
 * @returns {Promise<any>} - News data with exam information or 404 error.
 */
export const getNewsByExamId = async (newsId: number) => {
  try {
    const response = await fetch(`${API_URL}/exams/news/individual/${newsId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 10800 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return notFound();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching individual exam news:", error);
    return notFound();
  }
};
