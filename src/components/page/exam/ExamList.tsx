"use client";
import { ExamInformationDTO } from "@/api/@types/exam-type";
import { getExams } from "@/api/list/getExams";
import ExamFilters from "@/components/filters/ExamFilter";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ExamListCard from "@/components/cards/ExamListCard";
import { useParams, useRouter } from "next/navigation";
import {
  parseExamSlugToFilters,
  buildExamSlug,
} from "@/components/utils/slugFormat";
import { FilterIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
const Drawer = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.Drawer),
  { ssr: false }
);
const DrawerClose = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerClose),
  { ssr: false }
);
const DrawerContent = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerContent),
  { ssr: false }
);
const DrawerHeader = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerHeader),
  { ssr: false }
);
const DrawerTitle = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerTitle),
  { ssr: false }
);
const DrawerTrigger = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerTrigger),
  { ssr: false }
);
const DrawerFooter = dynamic(
  () => import("@/components/ui/drawer").then((mod) => mod.DrawerFooter),
  { ssr: false }
);

interface ExamsResponse {
  exams: ExamInformationDTO[];
  total: number;
  limit: number;
  page: number;
}

const SkeletonExamCard: React.FC = () => (
  <div className="border border-gray-200 rounded-lg shadow-sm animate-pulse bg-white">
    {/* Header Section */}
    <div className="flex items-start gap-4 p-5 border-b border-gray-200">
      <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-9 w-24 bg-gray-200 rounded" />
        <div className="h-9 w-24 bg-gray-200 rounded" />
      </div>
    </div>
    {/* Info Grid */}
    <div className="grid grid-cols-3 gap-4 p-5 border-b border-gray-200">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
    {/* Tab Links */}
    <div className="p-5">
      <div className="h-12 bg-gray-200 rounded" />
    </div>
  </div>
);

const ExamsList: React.FC = () => {
  const paramsRoute = useParams();
  const router = useRouter();

  // Extract slug from the correct parameter
  const rawSlug = paramsRoute?.filterSlug || "";
  const slug = Array.isArray(rawSlug) ? rawSlug.join("-") : rawSlug;

  const parsedFilters = parseExamSlugToFilters(slug);

  const [exams, setExams] = useState<ExamInformationDTO[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(parsedFilters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const urlUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);

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

      // Clear existing timer
      if (urlUpdateTimerRef.current) {
        clearTimeout(urlUpdateTimerRef.current);
      }

      // Debounce URL updates to prevent too many history API calls
      urlUpdateTimerRef.current = setTimeout(() => {
        // Build new slug from filters
        const newSlug = buildExamSlug({
          mode: newFilters.mode,
          level: newFilters.level,
          streams: newFilters.streams,
        });

        // Update URL with new slug - preserve the current path structure
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes("/exam/") ? "/exam" : "";
        const newUrl = `${basePath}${newSlug}`;

        // Use router.replace instead of window.history.pushState for better Next.js integration
        router.replace(newUrl, { scroll: false });
      }, 500); // 500ms debounce delay
    },
    [router]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimerRef.current) {
        clearTimeout(urlUpdateTimerRef.current);
      }
    };
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        {/* Filter Button and Exam Count */}
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Showing <span className="text-primary-main">{total}</span> Exams
            </h1>
            {/* <div className="flex items-center gap-2 mt-1">
              <button
                className="text-sm text-blue-600 font-medium"
                onClick={() => {
                  setFilters({ mode: [], streams: [], level: [] });
                  handleFilterChange({ mode: [], streams: [], level: [] });
                }}
              >
                Clear
              </button>
            </div> */}
          </div>
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 border border-red-500 text-red-500 rounded-lg">
                <FilterIcon className="w-5 h-5" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center justify-between">
                  <DrawerTitle>All Filters</DrawerTitle>
                  <DrawerClose asChild>
                    <button className="p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
                <ExamFilters
                  onFilterChange={(newFilters) => {
                    handleFilterChange(newFilters);
                  }}
                  initialFilters={filters}
                  isMobileDrawer={true}
                />
              </div>
              <DrawerFooter className="border-t border-gray-200">
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      const clearedFilters = {
                        mode: [],
                        streams: [],
                        level: [],
                      };
                      setFilters(clearedFilters);
                      handleFilterChange(clearedFilters);
                      setIsDrawerOpen(false);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium"
                  >
                    View Result
                  </button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Content */}
      <div className="container-body mx-auto py-4 lg:py-8 lg:pt-10">
        {/* Desktop Header Section */}
        <div className="hidden lg:block mb-6 px-4 lg:px-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Showing <span className="text-primary-main">{total}</span> Exams
            </h1>
            {/* <div className="flex items-center gap-3">
              <select className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white">
                <option>Recommended</option>
                <option>Latest</option>
                <option>Popular</option>
              </select>
            </div> */}
          </div>
          <SelectedFiltersDisplay />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block lg:sticky lg:top-4 lg:self-start">
            <ExamFilters
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </div>

          {/* Exam List */}
          <div className="flex-1">
            <div className="space-y-4">
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
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                No Exam with selected Filter
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsList;
