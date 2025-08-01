import { ExamInformationDTO } from "../@types/exam-type";

interface ExamsResponse {
  exams: ExamInformationDTO[];
  total: number;
  limit: number;
  page: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

interface GetExamsParams {
  page?: number;
  pageSize?: number;
  selectedFilters?: Record<string, string>;
}

const HEADERS = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  "Content-Type": "application/json",
} as const;

if (!API_URL || !BEARER_TOKEN) {
  throw new Error("Missing API configuration (API_URL or BEARER_TOKEN)");
}

export const getExams = async ({
  page = 1,
  pageSize = 16,
  selectedFilters = {},
}: GetExamsParams): Promise<ExamsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const apiURL = `${API_URL}/exams/listing?${params.toString()}`;

    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(apiURL, {
      method: "GET",
      headers: HEADERS,
      signal: controller.signal,
      // cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "API Error:",
        response.status,
        response.statusText,
        errorText
      );
      throw new Error(`API Error: ${response.statusText} (${response.status})`);
    }

    const { status, data } = await response.json();

    if (status !== "success") {
      throw new Error(`API Status Error: ${status}`);
    }

    return {
      ...data,
      limit: pageSize,
    } as ExamsResponse;
  } catch (error) {
    console.error("Error in getExams:", error);

    // If it's an abort error (timeout), provide a more specific message
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Request timeout: Failed to fetch exams within 30 seconds"
      );
    }

    throw new Error("Failed to fetch exams");
  }
};
