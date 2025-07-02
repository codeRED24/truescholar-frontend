"use client";

import { CollegesResponseDTO } from "@/api/@types/college-list";
import { getColleges } from "@/api/list/getColleges";
import CollegeFilter from "@/components/filters/CollegeFilters";
import CollegeSort from "@/components/filters/CollegeSort";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/components/utils/useMobile";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { IoClose, IoFilter } from "react-icons/io5";

const sessionCache = {
  get: (key: string) => {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  },
  set: (key: string, data: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      sessionStorage.clear();
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  },
};

const CollegeListCard = dynamic(
  () => import("@/components/cards/CollegeListCard"),
  {
    loading: () => (
      <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
    ),
    ssr: false,
  }
);

type CollegeListItemProps = {
  college: CollegesResponseDTO["colleges"][0];
  isLast: boolean;
  lastCollegeRef: (node: HTMLDivElement | null) => void;
};

type SortFunction = (
  a: CollegesResponseDTO["colleges"][0],
  b: CollegesResponseDTO["colleges"][0]
) => number;

// Unified fee ranges with consistent labels
const feeRanges = [
  { label: "Below 50K", value: "below_50k", min: 0, max: 50000 },
  { label: "50K - 1.5L", value: "50k_150k", min: 50000, max: 150000 },
  { label: "1.5L - 3L", value: "150k_300k", min: 150000, max: 300000 },
  { label: "3L - 5L", value: "300k_500k", min: 300000, max: 500000 },
  { label: "Above 5L", value: "above_500k", min: 500000, max: Infinity },
];

const CollegeListItem = React.memo(
  ({ college, isLast, lastCollegeRef }: CollegeListItemProps) => (
    <div ref={isLast ? lastCollegeRef : null}>
      <CollegeListCard college={college} />
    </div>
  )
);

const CollegeList = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collegesData, setCollegesData] = useState<
    CollegesResponseDTO["colleges"]
  >([]);
  const [filterSection, setFilterSection] = useState<
    CollegesResponseDTO["filter_section"]
  >({
    city_filter: [],
    state_filter: [],
    stream_filter: [],
    type_of_institute_filter: [],
    specialization_filter: [],
  });
  const [totalCollegesCount, setTotalCollegesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Record<string, string | string[]>>({
    city_id: searchParams.get("city") || "",
    state_id: searchParams.get("state") || "",
    stream_id: searchParams.get("stream") || "",
    type_of_institute:
      searchParams
        .get("type")
        ?.split(",")
        .map((t) => t.trim()) || [],
    fee_range: searchParams.get("fee_range")?.split(",") || [],
    city_id_name: searchParams.get("city") || "",
    state_id_name: searchParams.get("state") || "",
    stream_id_name: searchParams.get("stream") || "",
  });
  const [sortFn, setSortFn] = useState<SortFunction | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastCollegeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setPage((prev) => prev + 1);
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const generateCacheKey = (page: number, filters: Record<string, string>) => {
    return `colleges_${page}_${JSON.stringify(filters)}`;
  };

  const fetchColleges = useCallback(async () => {
    if (!hasMore) return;

    const apiFilters = {
      city_id: filters.city_id as string,
      state_id: filters.state_id as string,
      stream_id: filters.stream_id as string,
    };
    const cacheKey = generateCacheKey(page, apiFilters);
    const cachedData = sessionCache.get(cacheKey);
    if (cachedData) {
      setTotalCollegesCount(cachedData.total_colleges_count);
      setFilterSection(cachedData.filter_section);
      setCollegesData((prev: CollegesResponseDTO["colleges"]) => {
        const existingIds = new Set(
          prev.map((c: CollegesResponseDTO["colleges"][0]) => c.college_id)
        );
        const newColleges = cachedData.colleges.filter(
          (c: CollegesResponseDTO["colleges"][0]) =>
            !existingIds.has(c.college_id)
        );
        return page === 1 ? cachedData.colleges : [...prev, ...newColleges];
      });
      setHasMore(cachedData.colleges.length > 0);
      return;
    }

    setLoading(true);
    try {
      const data = await getColleges({ page, limit: 10, filters: apiFilters });
      sessionCache.set(cacheKey, data);
      setTotalCollegesCount(data.total_colleges_count);
      setFilterSection(data.filter_section);
      setCollegesData((prev: CollegesResponseDTO["colleges"]) => {
        const existingIds = new Set(
          prev.map((c: CollegesResponseDTO["colleges"][0]) => c.college_id)
        );
        const newColleges = data.colleges.filter(
          (c: CollegesResponseDTO["colleges"][0]) =>
            !existingIds.has(c.college_id)
        );
        return page === 1 ? data.colleges : [...prev, ...newColleges];
      });
      setHasMore(data.colleges.length > 0);
    } catch {
      setError("Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [page, filters.city_id, filters.state_id, filters.stream_id, hasMore]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const sanitizeForUrl = useCallback((value: string) => {
    return value
      .replace(/[^a-zA-Z0-9\s]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.city_id_name)
      params.set("city", sanitizeForUrl(filters.city_id_name as string));
    if (filters.state_id_name)
      params.set("state", sanitizeForUrl(filters.state_id_name as string));
    if (filters.stream_id_name)
      params.set("stream", sanitizeForUrl(filters.stream_id_name as string));
    if ((filters.type_of_institute as string[]).length > 0) {
      const sanitizedTypes = (filters.type_of_institute as string[])
        .map(sanitizeForUrl)
        .join(",");
      params.set("type", sanitizedTypes);
    }
    if ((filters.fee_range as string[]).length > 0) {
      params.set("fee_range", (filters.fee_range as string[]).join(","));
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filters, router, sanitizeForUrl]);

  const filteredColleges = useMemo(() => {
    let result = collegesData;

    // Apply type_of_institute filter
    const typeFilters = (filters.type_of_institute as string[]).map(
      sanitizeForUrl
    );
    if (typeFilters.length > 0) {
      const filterCacheKey = `filtered_${JSON.stringify(typeFilters)}_${
        result.length
      }`;
      const cachedFiltered = sessionCache.get(filterCacheKey);
      if (cachedFiltered) {
        result = cachedFiltered;
      } else {
        result = result.filter(
          (college: CollegesResponseDTO["colleges"][0]) => {
            const collegeType = sanitizeForUrl(college.type_of_institute ?? "");
            return typeFilters.includes(collegeType);
          }
        );
        sessionCache.set(filterCacheKey, result);
      }
    }

    // Apply fee range filter with improved logic
    const feeRangeFilters = filters.fee_range as string[];
    if (feeRangeFilters.length > 0) {
      const feeCacheKey = `fee_filtered_${JSON.stringify(feeRangeFilters)}_${
        result.length
      }`;
      const cachedFeeFiltered = sessionCache.get(feeCacheKey);
      if (cachedFeeFiltered) {
        result = cachedFeeFiltered;
      } else {
        result = result.filter(
          (college: CollegesResponseDTO["colleges"][0]) => {
            const minFees = Number(college.min_fees) || 0;
            const maxFees = Number(college.max_fees) || minFees || 0; // Use minFees if maxFees is not available

            return feeRangeFilters.some((range) => {
              const rangeSpec = feeRanges.find((r) => r.value === range);
              if (!rangeSpec) return false;

              // Check if either minFees or maxFees falls within the range
              // or if the college's range overlaps with the selected range
              const minInRange =
                minFees >= rangeSpec.min && minFees <= rangeSpec.max;
              const maxInRange =
                maxFees >= rangeSpec.min && maxFees <= rangeSpec.max;
              const rangeOverlap =
                minFees <= rangeSpec.min && maxFees >= rangeSpec.max;

              return minInRange || maxInRange || rangeOverlap;
            });
          }
        );
        sessionCache.set(feeCacheKey, result);
      }
    }

    // Apply sorting if sort function exists
    if (sortFn) {
      result = [...result].sort(sortFn);
    }

    return result;
  }, [
    collegesData,
    filters.type_of_institute,
    filters.fee_range,
    sanitizeForUrl,
    sortFn,
  ]);

  const handleFilterChange = useCallback(
    (newFilters: Record<string, string | string[]>) => {
      setFilters(newFilters);
      setPage(1);
      setCollegesData([]);
      setHasMore(true);
      setSortFn(null);
    },
    []
  );

  const handleSortChange = useCallback((newSortFn: SortFunction) => {
    setSortFn(() => newSortFn);
  }, []);

  const handleRemoveFilter = useCallback(
    (filterKey: string, value?: string) => {
      setFilters((prev) => {
        const updatedFilters = { ...prev };
        if (filterKey === "type_of_institute" && value) {
          updatedFilters[filterKey] = (prev[filterKey] as string[]).filter(
            (v) => v !== value
          );
        } else if (filterKey === "fee_range" && value) {
          updatedFilters[filterKey] = (prev[filterKey] as string[]).filter(
            (v) => v !== value
          );
        } else {
          updatedFilters[filterKey] = "";
          updatedFilters[`${filterKey}_name`] = "";
        }
        setPage(1);
        setCollegesData([]);
        setHasMore(true);
        return updatedFilters;
      });
    },
    []
  );

  return (
    <div className="md:py-14 container-body">
      <div className="hidden md:flex sticky top-0 z-10 pb-4 bg-[#f4f6f8] inset-x-0 gap-8 items-center">
        <h1 className="text-2xl font-bold mb-2">
          Colleges ({filteredColleges.length})
        </h1>
        <div className="flex flex-wrap gap-2 flex-1">
          {filters.city_id_name && (
            <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
              {filters.city_id_name}
              <button
                onClick={() => handleRemoveFilter("city_id")}
                className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
              >
                <IoClose />
              </button>
            </div>
          )}
          {filters.state_id_name && (
            <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
              {filters.state_id_name}
              <button
                onClick={() => handleRemoveFilter("state_id")}
                className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
              >
                <IoClose />
              </button>
            </div>
          )}
          {filters.stream_id_name && (
            <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
              {filters.stream_id_name}
              <button
                onClick={() => handleRemoveFilter("stream_id")}
                className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
              >
                <IoClose />
              </button>
            </div>
          )}
          {(filters.type_of_institute as string[]).map((type) => (
            <div
              key={type}
              className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl"
            >
              {type}
              <button
                onClick={() => handleRemoveFilter("type_of_institute", type)}
                className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
              >
                <IoClose />
              </button>
            </div>
          ))}
          {(filters.fee_range as string[]).map((range) => (
            <div
              key={range}
              className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl"
            >
              {feeRanges.find((r) => r.value === range)?.label || range}
              <button
                onClick={() => handleRemoveFilter("fee_range", range)}
                className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
              >
                <IoClose />
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto">
          <CollegeSort onSortChange={handleSortChange} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-4">
        {isMobile ? (
          <>
            <div className="sticky top-0 z-10 pb-2 bg-[#f4f6f8]">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-semibold font-public mb-2">
                  Colleges ({filteredColleges.length})
                </h1>
                <div className="flex gap-2">
                  <CollegeSort onSortChange={handleSortChange} />
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="md:hidden text-primary-main rounded-2xl">
                        <IoFilter />
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-72 p-0 overflow-y-auto"
                    >
                      <CollegeFilter
                        filterSection={filterSection}
                        onFilterChange={handleFilterChange}
                        isLoading={loading}
                        selectedFilters={filters}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.city_id_name && (
                  <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
                    {filters.city_id_name}
                    <button
                      onClick={() => handleRemoveFilter("city_id")}
                      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
                    >
                      <IoClose />
                    </button>
                  </div>
                )}
                {filters.state_id_name && (
                  <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
                    {filters.state_id_name}
                    <button
                      onClick={() => handleRemoveFilter("state_id")}
                      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
                    >
                      <IoClose />
                    </button>
                  </div>
                )}
                {filters.stream_id_name && (
                  <div className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl">
                    {filters.stream_id_name}
                    <button
                      onClick={() => handleRemoveFilter("stream_id")}
                      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
                    >
                      <IoClose />
                    </button>
                  </div>
                )}
                {(filters.type_of_institute as string[]).map((type) => (
                  <div
                    key={type}
                    className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl"
                  >
                    {type}
                    <button
                      onClick={() =>
                        handleRemoveFilter("type_of_institute", type)
                      }
                      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
                {(filters.fee_range as string[]).map((range) => (
                  <div
                    key={range}
                    className="flex items-center bg-[#919EAB1F] text-[#1C252E] text-sm font-medium capitalize px-3 py-1 rounded-2xl"
                  >
                    {feeRanges.find((r) => r.value === range)?.label || range}
                    <button
                      onClick={() => handleRemoveFilter("fee_range", range)}
                      className="ml-2 text-xxs bg-[#1C252E] text-white rounded-full p-0.5"
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-1/4 pr-4">
            <CollegeFilter
              filterSection={filterSection}
              onFilterChange={handleFilterChange}
              isLoading={loading}
              selectedFilters={filters}
            />
          </div>
        )}
        <div className="w-full md:w-3/4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="space-y-4">
            {filteredColleges.map(
              (college: CollegesResponseDTO["colleges"][0], index: number) => (
                <CollegeListItem
                  key={college.college_id}
                  college={college}
                  isLast={index === filteredColleges.length - 1}
                  lastCollegeRef={lastCollegeRef}
                />
              )
            )}
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32"
                />
              ))}
            {!loading && filteredColleges.length === 0 && (
              <div className="text-center text-gray-500">
                No colleges found with the applied filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeList;
