import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

// if (!API_URL || !BEARER_TOKEN) {
//   throw new Error(
//     "Missing required environment variables: API_URL or BEARER_TOKEN."
//   );
// }

/**
 * Fetch exam data for a given exam ID and silo dynamically.
 * @param {number} examId - The exam ID.
 * @param {string} silos - The silo name (e.g., "info", "syllabus").
 * @returns {Promise<any>} - Exam data response or 404 error.
 */
export const getExamsById = async (examId: number, silos: string) => {
  if (!silos) {
    return notFound();
  }

  try {
    const response = await fetch(`${API_URL}/exams/silos/${examId}/${silos}`, {
      method: "GET",
      headers: {
        // Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} - ${response.statusText}`);
      return notFound();
    }

    return await response.json();
  } catch {
    return notFound();
  }
};
