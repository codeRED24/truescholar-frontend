"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { CollegesResponseDTO, CollegeDTO } from "@/api/@types/college-list";
import { getColleges } from "@/api/list/getColleges";
import dynamic from "next/dynamic";

const CollegeListCard = dynamic(
  () => import("@/components/cards/CollegeListCard"),
  {
    loading: () => (
      <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
    ),
    ssr: false,
  },
);

type CollegeListItemProps = {
  college: CollegeDTO;
  isLast: boolean;
  lastCollegeRef: (node: HTMLDivElement | null) => void;
};

const CollegeListItem = React.memo(
  ({ college, isLast, lastCollegeRef }: CollegeListItemProps) => (
    <div ref={isLast ? lastCollegeRef : null}>
      <CollegeListCard college={college} />
    </div>
  ),
);
CollegeListItem.displayName = "CollegeListItem";

interface CollegeFilterClientProps {
  initialColleges: CollegeDTO[];
  initialTotalCount: number;
  title: string;
  filters: {
    stream_name?: string;
    city_name?: string;
    state_name?: string;
  };
}

export default function CollegeFilterClient({
  initialColleges,
  initialTotalCount,
  title,
  filters,
}: CollegeFilterClientProps) {
  const [collegesData, setCollegesData] =
    useState<CollegeDTO[]>(initialColleges);
  const [totalCollegesCount, setTotalCollegesCount] =
    useState(initialTotalCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(2); // Start from page 2 since page 1 is SSR
  const [hasMore, setHasMore] = useState(initialColleges.length === 10);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastCollegeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 },
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const fetchMoreColleges = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const data = await getColleges({
        page,
        limit: 10,
        filters: {
          stream_name: filters.stream_name || "",
          city_name: filters.city_name || "",
          state_name: filters.state_name || "",
        },
      });
      setTotalCollegesCount(data.total_colleges_count);
      setCollegesData((prev) => [...prev, ...data.colleges]);
      setHasMore(data.colleges.length === 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [page, filters, hasMore, loading]);

  useEffect(() => {
    // Only fetch more if page > 1 (initial page is SSR)
    if (page > 1) {
      fetchMoreColleges();
    }
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="md:py-14 container-body">
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4 md:mb-2 capitalize">
            {title} ({collegesData.length}/{totalCollegesCount})
          </h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            {collegesData.map((college, index) => (
              <CollegeListItem
                key={college.college_id}
                college={college}
                isLast={index === collegesData.length - 1}
                lastCollegeRef={lastCollegeRef}
              />
            ))}
            {loading &&
              Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`loading-${i}`}
                  className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32"
                />
              ))}
            {!loading && collegesData.length === 0 && (
              <div className="text-center text-gray-500 col-span-2">
                No colleges found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
