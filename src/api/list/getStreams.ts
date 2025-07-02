"use server";

export interface StreamProps {
  stream_id: number;
  created_at: string;
  updated_at: string;
  stream_name: string;
  logo_url: string | null;
  slug: string;
  is_active: boolean;
  kapp_score: string;
  is_online: boolean;
}

export const getStreams = async (): Promise<StreamProps[]> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    throw new Error(
      "API URL or Bearer token is missing from environment variables."
    );
  }

  const response = await fetch(`${API_URL}/streams`, {
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
    const data: StreamProps[] = await response.json();
    return data;
  } catch {
    throw new Error("Failed to parse response as JSON.");
  }
};