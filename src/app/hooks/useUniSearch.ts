"use client";

import { useState, useCallback } from "react";
// import axios from "axios";

export interface UniSearchResult {
  colleges: any[];
}

export function useUniSearch() {
  const [results, setResults] = useState<UniSearchResult>({ colleges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/college-search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setResults({ colleges: data.data.colleges || [] });
    } catch (err: any) {
      setError(err.message || "Error searching universities");
      setResults({ colleges: [] });

      console.log({ results });
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
