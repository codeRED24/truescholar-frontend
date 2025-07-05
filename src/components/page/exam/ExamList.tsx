"use client";
import { ExamInformationDTO } from "@/api/@types/exam-type";
import { getExams } from "@/api/list/getExams";
import ExamFilters from "@/components/filters/ExamFilter";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ExamListCard from "@/components/cards/ExamListCard";
import { useParams } from "next/navigation";
import {
  parseExamSlugToFilters,
  buildExamSlug,
} from "@/components/utils/slugFormat";

interface ExamsResponse {
  exams: ExamInformationDTO[];
  total: number;
  limit: number;
  page: number;
}

const SkeletonExamCard: React.FC = () => (
  <div className="border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse bg-white">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`h-4 bg-gray-200 rounded w-${6 - i}/6`} />
      ))}
    </div>
  </div>
);

const ExamsList: React.FC = () => {
  const paramsRoute = useParams();

  // Extract slug from the correct parameter
  const rawSlug = paramsRoute?.filterSlug || "";
  const slug = Array.isArray(rawSlug) ? rawSlug.join("-") : rawSlug;

  const parsedFilters = parseExamSlugToFilters(slug);

  const [exams, setExams] = useState<ExamInformationDTO[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(parsedFilters);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchExams = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        setError(null);

        const selectedFilters: Record<string, string> = {};
        if (filters.mode.length)
          selectedFilters["mode_of_exam"] = filters.mode.join(",");
        if (filters.streams.length)
          selectedFilters["exam_streams"] = filters.streams.join(",");
        if (filters.level.length)
          selectedFilters["exam_level"] = filters.level.join(",");

        const response: ExamsResponse = await getExams({
          page: pageNum,
          pageSize: 16,
          selectedFilters,
        });

        setExams((prev) => {
          const newExams =
            pageNum === 1 ? response.exams : [...prev, ...response.exams];
          setHasMore(
            response.exams.length > 0 && newExams.length < response.total
          );
          return newExams;
        });
        setTotal(response.total);
      } catch (err) {
        setError("Failed to fetch exams. Please try again.");
        console.error("Fetch Exams Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    setPage(1);
    fetchExams(1);
  }, [filters]);

  useEffect(() => {
    if (page > 1) {
      fetchExams(page);
    }
  }, [page]);

  const lastExamRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handleFilterChange = useCallback(
    (newFilters: { mode: string[]; streams: string[]; level: string[] }) => {
      setFilters(newFilters);

      // Build new slug from filters
      const newSlug = buildExamSlug({
        mode: newFilters.mode,
        level: newFilters.level,
        streams: newFilters.streams,
      });

      // console.log("New slug:", newSlug);

      // Update URL with new slug - preserve the current path structure
      const currentPath = window.location.pathname;
      const basePath = currentPath.includes("/exam/") ? "/exam" : "";
      const newUrl = `${basePath}${newSlug}`;

      // console.log("New URL:", newUrl);
      window.history.pushState({}, "", newUrl);
    },
    []
  );

  const clearFilter = useCallback(
    (type: keyof typeof filters, value: string) => {
      const newFilters = {
        ...filters,
        [type]: filters[type].filter((item) => item !== value),
      };
      setFilters(newFilters);
      handleFilterChange(newFilters);
    },
    [filters, handleFilterChange]
  );

  const SelectedFiltersDisplay = () => {
    const allSelected = [
      // ...filters.category.map((val) => ({ type: "category", value: val })),
      ...filters.streams.map((val) => ({ type: "streams", value: val })),
      ...filters.level.map((val) => ({ type: "level", value: val })),
    ];

    if (!allSelected.length) return null;

    return (
      <div className="flex flex-wrap gap-2 my-2">
        {allSelected.map(({ type, value }) => (
          <span
            key={`${type}-${value}`}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
            onClick={() => clearFilter(type as keyof typeof filters, value)}
          >
            {value}
            <button
              className="ml-1 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                clearFilter(type as keyof typeof filters, value);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="flex md:justify-between items-center flex-wrap">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore Exams</h1>
        <SelectedFiltersDisplay />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ExamFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {exams.map((exam, index) => (
              <div
                key={exam.exam_id}
                ref={index === exams.length - 1 ? lastExamRef : null}
              >
                <ExamListCard exam={exam} />
              </div>
            ))}
            {loading &&
              [...Array(6)].map((_, i) => <SkeletonExamCard key={i} />)}
          </div>

          {!loading && !hasMore && exams.length > 0 && (
            <div className="text-center mt-8 text-gray-500 text-sm">
              No more exams to load ({exams.length}/{total})
            </div>
          )}

          {exams.length === 0 && !loading && !error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-2xl shadow-sm">
              No Exam with selected Filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamsList;
