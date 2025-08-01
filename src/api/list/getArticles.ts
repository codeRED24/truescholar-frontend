import { ArticlesApiResponseDTO } from "../@types/Articles-type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

const headers = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  "Content-Type": "application/json",
};

export const getArticles = async (
  page: number = 1,
  pageSize: number = 16
): Promise<ArticlesApiResponseDTO> => {
  if (!API_URL || !BEARER_TOKEN) {
    throw new Error("Missing API configuration");
  }

  try {
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      `${API_URL}/articles?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText} (${response.status})`);
    }

    const data: ArticlesApiResponseDTO = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getArticles:", error);

    // If it's an abort error (timeout), provide a more specific message
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Request timeout: Failed to fetch articles within 30 seconds"
      );
    }

    throw error;
  }
};
