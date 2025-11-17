import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch exam news data for a given exam ID.
 * @param {number} examId - The exam ID.
 * @returns {Promise<any>} - Exam data with news section or 404 error.
 */
export const getExamNewsById = async (examId: number) => {
  try {
    const response = await fetch(`${API_URL}/exams/news/${examId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return notFound();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exam news:", error);
    return notFound();
  }
};
