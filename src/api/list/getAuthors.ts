const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

export interface Author {
  author_id: number;
  author_name: string;
  email: string;
  view_name?: string;
  is_active: boolean;
  about?: string;
  image?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export async function getAuthors(): Promise<Author[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/authors`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const authors = await response.json();
    return authors || [];
  } catch (error) {
    console.error("Error fetching authors:", error);
    return [];
  }
}
