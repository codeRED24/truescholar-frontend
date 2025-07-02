import { notFound } from "next/navigation";

export const getArticlesById = async (article_id: number) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

  if (!API_URL || !BEARER_TOKEN) {
    throw new Error(
      "API URL or Bearer token is missing from environment variables."
    );
  }

  try {
    const response = await fetch(`${API_URL}/articles/${article_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching article ${article_id}: ${response.statusText}`
      );
      return notFound();
    }

    const data = await response.json();
    return data;
  } catch {
    return notFound();
  }
};