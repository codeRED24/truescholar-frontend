// "use server";

export interface StateDto {
  state_id: number;
  name: string;
  city_name: string;
  logo_url: string;
  kapp_score: string;
  college_count: number;
}

export const getStates = async (): Promise<StateDto[]> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    throw new Error(
      "API URL or Bearer token is missing from environment variables."
    );
  }

  const response = await fetch(`${API_URL}/states`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 10800 },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  try {
    const data: StateDto[] = await response.json();
    return data;
  } catch {
    throw new Error("Failed to parse response as JSON.");
  }
};
