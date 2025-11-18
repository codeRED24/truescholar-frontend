"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import debounce from "lodash/debounce";
import { RotateCcw, X } from "lucide-react";
import {
  CityFilterItem,
  CourseGroupFilterItem,
  FilterSectionDTO,
  StateFilterItem,
  StreamFilterItem,
  TypeOfInstituteFilterItem,
} from "@/api/@types/college-list";

interface CollegeFilterProps {
  filterSection: FilterSectionDTO;
  onFilterChange: (filters: Record<string, string | string[]>) => void;
  isLoading?: boolean;
  selectedFilters: Record<string, string | string[]>;
}

const SkeletonFilterItem = () => (
  <div className="flex items-center space-x-2 animate-pulse my-2">
    <div className="w-4 h-4 bg-gray-300 rounded"></div>
    <div className="w-full h-4 bg-gray-300 rounded"></div>
  </div>
);

const feeRanges = [
  { label: "Below 50K", value: "below_50k", min: 0, max: 50000 },
  { label: "50K - 1.5L", value: "50k_150k", min: 50000, max: 150000 },
  { label: "1.5L - 3L", value: "150k_300k", min: 150000, max: 300000 },
  { label: "3L - 5L", value: "300k_500k", min: 300000, max: 500000 },
  { label: "Above 5L", value: "above_500k", min: 500000, max: Infinity },
];

const CollegeFilter: React.FC<CollegeFilterProps> = memo(
  ({ filterSection, onFilterChange, isLoading = false, selectedFilters }) => {
    const [searchTerms, setSearchTerms] = useState({
      city: "",
      state: "",
      stream: "",
      course_group: "",
    });

    // Helper function to normalize values for comparison
    const normalizeValue = useCallback(
      (val: string | null | undefined): string =>
        (val || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
      []
    );

    const handleApiFilterChange = useCallback(
      (filterType: string, value: string) => {
        const updatedFilters = { ...selectedFilters };

        if (
          filterType === "city_name" ||
          filterType === "state_name" ||
          filterType === "stream_name" ||
          filterType === "course_group_name"
        ) {
          // For single-select filters (radio buttons), replace the value
          updatedFilters[filterType] = value;
        } else if (
          filterType === "type_of_institute" ||
          filterType === "fee_range"
        ) {
          // For multi-select filters (checkboxes), toggle the value in array
          const currentValues = updatedFilters[filterType] as string[];
          const valueIndex = currentValues.indexOf(value);

          if (valueIndex === -1) {
            // Value not in array, add it
            updatedFilters[filterType] = [...currentValues, value];
          } else {
            // Value in array, remove it
            updatedFilters[filterType] = currentValues.filter(
              (item) => item !== value
            );
          }
        }

        onFilterChange(updatedFilters);
      },
      [selectedFilters, onFilterChange]
    );

    const handleClearFilters = useCallback(() => {
      const clearedFilters = {
        city_name: "",
        state_name: "",
        stream_name: "",
        course_group_name: "",
        type_of_institute: [],
        fee_range: [],
      };
      onFilterChange(clearedFilters);
      setSearchTerms({ city: "", state: "", stream: "", course_group: "" });
    }, [onFilterChange]);

    const debouncedSearchChange = useMemo(
      () =>
        debounce((filterType: string, value: string) => {
          setSearchTerms((prev) => ({
            ...prev,
            [filterType]: value.toLowerCase(),
          }));
        }, 100),
      []
    );

    const handleClearSearch = useCallback((filterType: string) => {
      setSearchTerms((prev) => ({
        ...prev,
        [filterType]: "",
      }));
    }, []);

    const areFiltersApplied = useCallback(
      () =>
        selectedFilters.city_name !== "" ||
        selectedFilters.state_name !== "" ||
        selectedFilters.stream_name !== "" ||
        selectedFilters.course_group_name !== "" ||
        (selectedFilters.type_of_institute as string[]).length > 0 ||
        (selectedFilters.fee_range as string[]).length > 0,
      [selectedFilters]
    );

    const filteredCities = useMemo(
      () =>
        filterSection.city_filter.filter((city: CityFilterItem) =>
          city.city_name?.toLowerCase().includes(searchTerms.city)
        ),
      [filterSection.city_filter, searchTerms.city]
    );

    const filteredStates = useMemo(
      () =>
        filterSection.state_filter.filter((state: StateFilterItem) =>
          state.state_name?.toLowerCase().includes(searchTerms.state)
        ),
      [filterSection.state_filter, searchTerms.state]
    );

    const filteredStreams = useMemo(
      () =>
        filterSection.stream_filter.filter((stream: StreamFilterItem) =>
          stream.stream_name?.toLowerCase().includes(searchTerms.stream)
        ),
      [filterSection.stream_filter, searchTerms.stream]
    );

    const filteredCourseGroups = useMemo(
      () =>
        filterSection.course_group_filter?.filter(
          (courseGroup: CourseGroupFilterItem) =>
            courseGroup.course_group_name
              ?.toLowerCase()
              .includes(searchTerms.course_group)
        ),
      [filterSection.course_group_filter, searchTerms.course_group]
    );

    return (
      <div className="bg-white rounded-2xl shadow-md max-w-xs sticky top-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium font-public">Filters</h2>
          <button
            aria-label="Remove all filters"
            onClick={handleClearFilters}
            disabled={!areFiltersApplied()}
            className={`text-md text-blue-600 hover:underline focus:outline-none ${
              !areFiltersApplied() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <RotateCcw />
          </button>
        </div>
        <div className="p-4 space-y-1 overflow-y-auto max-h-[90vh]">
          <>
            <h3 className="font-medium">Cities</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerms.city}
                onChange={(e) => debouncedSearchChange("city", e.target.value)}
                className="w-full p-2 mb-2 border rounded-xl h-9 pr-8"
                disabled={isLoading}
              />
              {searchTerms.city && (
                <button
                  onClick={() => handleClearSearch("city")}
                  className="absolute right-3 top-[18px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.city_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredCities.map((city: CityFilterItem) => (
                    <label
                      key={city.city_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="city_name"
                        checked={
                          normalizeValue(
                            selectedFilters.city_name as string
                          ) === normalizeValue(city.city_name || "")
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "city_name",
                            city.city_name ?? ""
                          )
                        }
                      />
                      <span>
                        {city.city_name} ({city.count})
                      </span>
                    </label>
                  ))}
            </div>
          </>
          <>
            <h3 className="font-medium">States</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerms.state}
                onChange={(e) => debouncedSearchChange("state", e.target.value)}
                className="w-full p-2 mb-2 border rounded-xl h-9 pr-8"
                disabled={isLoading}
              />
              {searchTerms.state && (
                <button
                  onClick={() => handleClearSearch("state")}
                  className="absolute right-3 top-[18px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.state_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredStates.map((state: StateFilterItem) => (
                    <label
                      key={state.state_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="state_name"
                        checked={
                          normalizeValue(
                            selectedFilters.state_name as string
                          ) === normalizeValue(state.state_name || "")
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "state_name",
                            state.state_name ?? ""
                          )
                        }
                      />
                      <span>
                        {state.state_name} ({state.count})
                      </span>
                    </label>
                  ))}
            </div>
          </>
          <>
            <h3 className="font-medium">Streams</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search streams..."
                value={searchTerms.stream}
                onChange={(e) =>
                  debouncedSearchChange("stream", e.target.value)
                }
                className="w-full p-2 mb-2 border rounded-xl h-9 pr-8"
                disabled={isLoading}
              />
              {searchTerms.stream && (
                <button
                  onClick={() => handleClearSearch("stream")}
                  className="absolute right-3 top-[18px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.stream_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredStreams.map((stream: StreamFilterItem) => (
                    <label
                      key={stream.stream_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="stream_name"
                        checked={
                          normalizeValue(
                            selectedFilters.stream_name as string
                          ) === normalizeValue(stream.stream_name || "")
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "stream_name",
                            stream.stream_name ?? ""
                          )
                        }
                      />
                      <span>
                        {stream.stream_name} ({stream.count})
                      </span>
                    </label>
                  ))}
            </div>
          </>
          <>
            <h3 className="font-medium">Courses</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search course groups..."
                value={searchTerms.course_group}
                onChange={(e) =>
                  debouncedSearchChange("course_group", e.target.value)
                }
                className="w-full p-2 mb-2 border rounded-xl h-9 pr-8"
                disabled={isLoading}
              />
              {searchTerms.course_group && (
                <button
                  onClick={() => handleClearSearch("course_group")}
                  className="absolute right-3 top-[18px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <X className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection?.course_group_filter?.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredCourseGroups?.map(
                    (courseGroup: CourseGroupFilterItem) => (
                      <label
                        key={courseGroup.course_group_id}
                        className="flex items-center space-x-2 text-sm font-public"
                      >
                        <input
                          type="radio"
                          name="course_group_name"
                          checked={
                            normalizeValue(
                              selectedFilters.course_group_name as string
                            ) ===
                            normalizeValue(courseGroup.course_group_name || "")
                          }
                          onChange={() =>
                            handleApiFilterChange(
                              "course_group_name",
                              courseGroup.course_group_name ?? ""
                            )
                          }
                        />
                        <span>{courseGroup.course_group_name}</span>
                      </label>
                    )
                  )}
            </div>
          </>
          <>
            <h3 className="font-medium">Type of Institute</h3>
            {isLoading || filterSection.type_of_institute_filter.length === 0
              ? Array.from({ length: 8 }, (_, index) => (
                  <SkeletonFilterItem key={index} />
                ))
              : filterSection.type_of_institute_filter.map(
                  (type: TypeOfInstituteFilterItem) => (
                    <label
                      key={type.value}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        checked={(
                          selectedFilters.type_of_institute as string[]
                        ).some(
                          (selectedValue) =>
                            normalizeValue(selectedValue) ===
                            normalizeValue(type.value ?? "")
                        )}
                        onChange={() =>
                          handleApiFilterChange(
                            "type_of_institute",
                            type.value ?? ""
                          )
                        }
                      />
                      <span>
                        {type.value} ({type.count})
                      </span>
                    </label>
                  )
                )}
          </>
          <>
            <h3 className="font-medium">Fee Range</h3>
            {isLoading
              ? Array.from({ length: 5 }, (_, index) => (
                  <SkeletonFilterItem key={index} />
                ))
              : feeRanges.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center space-x-2 text-sm font-public"
                  >
                    <input
                      type="radio"
                      checked={(selectedFilters.fee_range as string[]).includes(
                        range.value
                      )}
                      onChange={() =>
                        handleApiFilterChange("fee_range", range.value)
                      }
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
          </>
        </div>
      </div>
    );
  }
);

CollegeFilter.displayName = "CollegeFilter";

export default CollegeFilter;
