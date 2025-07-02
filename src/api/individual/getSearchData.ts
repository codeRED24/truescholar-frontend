import { SearchResultDTO } from "../@types/search-type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

if (!API_URL || !BEARER_TOKEN) {
  throw new Error("Missing API URL or Bearer token in environment variables.");
}

const ERROR_MESSAGES: Record<string, string> = {
  ECONNREFUSED: "Server is unavailable. Please try again later.",
  ENETUNREACH: "Network error: Check your internet connection.",
};

export const getSearchData = async (): Promise<SearchResultDTO> => {
  try {
    const response = await fetch(`${API_URL}/home-page/search`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as SearchResultDTO;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const errorMessage = ERROR_MESSAGES[(error as NodeJS.ErrnoException).code ?? ""] || "An unexpected error occurred.";
      throw new Error(errorMessage);
    }
    throw new Error("An unknown error occurred.");
  }
};
