import { useState, useEffect, useCallback } from "react";
import { AuthorTabType } from "./useAuthorTabData";

export interface InfiniteAuthorTabDataParams {
  authorId: string | number;
  type: AuthorTabType;
  limit?: number;
}

export interface InfiniteAuthorTabDataResult<T = any> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  total: number;
}

interface ApiResponse<T> {
  type: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export function useInfiniteAuthorTabData<T = any>({
  authorId,
  type,
  limit = 10,
}: InfiniteAuthorTabDataParams): InfiniteAuthorTabDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const url = `${process.env.NEXT_PUBLIC_API_URL}/authors/author-data/${authorId}?type=${type}&page=${pageNum}&limit=${limit}`;
        const res = await fetch(url, { next: { revalidate: 10800 } });

        if (!res.ok) {
          throw new Error("Failed to fetch author tab data");
        }

        const response: ApiResponse<T> = await res.json();

        if (reset || pageNum === 1) {
          setData(response.data);
        } else {
          setData((prevData) => [...prevData, ...response.data]);
        }

        setTotal(response.total);
        setHasMore(
          response.data.length === limit &&
            data.length + response.data.length < response.total
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [authorId, type, limit, data.length]
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [fetchData, loadingMore, hasMore, page]);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
    fetchData(1, true);
  }, [authorId, type, limit]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    total,
  };
}
