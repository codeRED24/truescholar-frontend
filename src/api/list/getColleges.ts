import { CollegesResponseDTO } from "../@types/college-list";

const createQueryString = (params: Record<string, string | number>): string =>
  new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

export const getColleges = async ({
  limit = 10,
  page,
  filters = {},
}: {
  limit?: number;
  page: number;
  filters?: Record<string, string | string[]>;
}): Promise<CollegesResponseDTO> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    console.error(
      "⚠️ Missing API URL or Bearer token. Check environment variables."
    );
    throw new Error("API URL or Bearer token is missing.");
  }

  const queryParams: Record<string, string | number> = { limit, page };
  if (filters.city_name && typeof filters.city_name === "string")
    queryParams.city_name = filters.city_name;
  if (filters.state_name && typeof filters.state_name === "string")
    queryParams.state_name = filters.state_name;
  if (filters.stream_name && typeof filters.stream_name === "string")
    queryParams.stream_name = filters.stream_name;
  if (
    filters.type_of_institute &&
    Array.isArray(filters.type_of_institute) &&
    filters.type_of_institute.length > 0
  ) {
    queryParams.type_of_institute = filters.type_of_institute.join(",");
  }
  if (
    filters.fee_range &&
    Array.isArray(filters.fee_range) &&
    filters.fee_range.length > 0
  ) {
    queryParams.fee_range = filters.fee_range.join(",");
  }

  const requestUrl = `${API_URL}/college-info?${createQueryString(
    queryParams
  )}`;

  try {
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      filter_section: {
        city_filter: data.filter_section?.city_filter ?? [],
        state_filter: data.filter_section?.state_filter ?? [],
        stream_filter: data.filter_section?.stream_filter ?? [],
        type_of_institute_filter:
          data.filter_section?.type_of_institute_filter ?? [],
        specialization_filter: data.filter_section?.specialization_filter ?? [],
      },
      colleges: data.colleges ?? [],
      total_colleges_count: data.total_colleges_count ?? 0,
    };
  } catch (error) {
    console.error("Error in getColleges:", error);

    // If it's an abort error (timeout), provide a more specific message
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        "Request timeout: Failed to fetch colleges within 30 seconds"
      );
    }

    throw new Error("Failed to fetch colleges data.");
  }
};
