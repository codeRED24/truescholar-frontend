import { useState, useEffect } from "react";

export type AuthorTabType = "articles" | "exams" | "colleges";

export interface AuthorTabDataParams {
  authorId: string | number;
  type: AuthorTabType;
  page?: number;
  limit?: number;
}

export interface StandardizedContentItem {
  id: number;
  title: string;
  meta_desc?: string;
  img1_url?: string;
  updated_at?: string;
  category: "article" | "exam" | "college";
  slug?: string;
  entity_id?: number;
  entity_name?: string;
}

export interface AuthorTabDataResponse {
  type: string;
  data: StandardizedContentItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthorTabDataResult<T = AuthorTabDataResponse> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAuthorTabData<T = AuthorTabDataResponse>({
  authorId,
  type,
  page = 1,
  limit = 10,
}: AuthorTabDataParams): AuthorTabDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/authors/author-data/${authorId}?type=${type}&page=${page}&limit=${limit}`;
    fetch(url, { next: { revalidate: 10800 } })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch author tab data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [authorId, type, page, limit]);

  return { data, loading, error };
}
