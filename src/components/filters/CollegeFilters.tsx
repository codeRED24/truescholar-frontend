"use client";

import { FilterSectionDTO } from "@/api/@types/college-list";
import React, { useState, useCallback, useMemo, memo } from "react";
import debounce from "lodash/debounce";
import { IoReloadSharp, IoClose } from "react-icons/io5";

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
    });

    const formatForUrl = useCallback(
      (value: string): string => value.toLowerCase().replace(/\s+/g, ""),
      []
    );

    const handleApiFilterChange = useCallback(
      (filterType: string, value: string, name: string) => {
        const newFilters = {
          ...selectedFilters,
          [filterType]: value === selectedFilters[filterType] ? "" : value,
          [`${filterType}_name`]:
            value === selectedFilters[filterType] ? "" : formatForUrl(name),
        };
        onFilterChange(newFilters);
      },
      [selectedFilters, onFilterChange, formatForUrl]
    );

    const handleLocalFilterChange = useCallback(
      (filterType: string, value: string) => {
        const currentValues = selectedFilters[filterType] as string[];
        const formattedValue = formatForUrl(value);
        const updatedValues = currentValues.includes(formattedValue)
          ? currentValues.filter((v) => v !== formattedValue)
          : [...currentValues, formattedValue];
        const newFilters = { ...selectedFilters, [filterType]: updatedValues };
        onFilterChange(newFilters);
      },
      [selectedFilters, onFilterChange, formatForUrl]
    );

    const handleClearFilters = useCallback(() => {
      const clearedFilters = {
        city_id: "",
        state_id: "",
        stream_id: "",
        type_of_institute: [],
        fee_range: [], // Added fee_range to cleared filters
        city_id_name: "",
        state_id_name: "",
        stream_id_name: "",
      };
      onFilterChange(clearedFilters);
      setSearchTerms({ city: "", state: "", stream: "" });
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
        selectedFilters.city_id !== "" ||
        selectedFilters.state_id !== "" ||
        selectedFilters.stream_id !== "" ||
        (selectedFilters.type_of_institute as string[]).length > 0 ||
        (selectedFilters.fee_range as string[]).length > 0,
      [selectedFilters]
    );

    const filteredCities = useMemo(
      () =>
        filterSection.city_filter.filter((city) =>
          city.city_name?.toLowerCase().includes(searchTerms.city)
        ),
      [filterSection.city_filter, searchTerms.city]
    );

    const filteredStates = useMemo(
      () =>
        filterSection.state_filter.filter((state) =>
          state.state_name?.toLowerCase().includes(searchTerms.state)
        ),
      [filterSection.state_filter, searchTerms.state]
    );

    const filteredStreams = useMemo(
      () =>
        filterSection.stream_filter.filter((stream) =>
          stream.stream_name?.toLowerCase().includes(searchTerms.stream)
        ),
      [filterSection.stream_filter, searchTerms.stream]
    );

    return (
      <div className="bg-white rounded-2xl shadow-md max-w-xs sticky top-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium font-public">Filters</h2>
          <button
            onClick={handleClearFilters}
            disabled={!areFiltersApplied()}
            className={`text-md text-blue-600 hover:underline focus:outline-none ${
              !areFiltersApplied() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <IoReloadSharp />
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
                  <IoClose className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.city_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredCities.map((city) => (
                    <label
                      key={city.city_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="city_id"
                        checked={
                          selectedFilters.city_id === String(city.city_id)
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "city_id",
                            String(city.city_id ?? ""),
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
                onChange={(e) =>
                  debouncedSearchChange("state", e.target.value)
                }
                className="w-full p-2 mb-2 border rounded-xl h-9 pr-8"
                disabled={isLoading}
              />
              {searchTerms.state && (
                <button
                  onClick={() => handleClearSearch("state")}
                  className="absolute right-3 top-[18px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isLoading}
                >
                  <IoClose className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.state_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredStates.map((state) => (
                    <label
                      key={state.state_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="state_id"
                        checked={
                          selectedFilters.state_id === String(state.state_id)
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "state_id",
                            String(state.state_id ?? ""),
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
                  <IoClose className="text-white bg-primary-main rounded-full p-0.5" />
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {isLoading || filterSection.stream_filter.length === 0
                ? Array.from({ length: 8 }, (_, index) => (
                    <SkeletonFilterItem key={index} />
                  ))
                : filteredStreams.map((stream) => (
                    <label
                      key={stream.stream_id}
                      className="flex items-center space-x-2 text-sm font-public"
                    >
                      <input
                        type="radio"
                        name="stream_id"
                        checked={
                          selectedFilters.stream_id === String(stream.stream_id)
                        }
                        onChange={() =>
                          handleApiFilterChange(
                            "stream_id",
                            String(stream.stream_id ?? ""),
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
            <h3 className="font-medium">Type of Institute</h3>
            {isLoading || filterSection.type_of_institute_filter.length === 0
              ? Array.from({ length: 8 }, (_, index) => (
                  <SkeletonFilterItem key={index} />
                ))
              : filterSection.type_of_institute_filter.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center space-x-2 text-sm font-public"
                  >
                    <input
                      type="checkbox"
                      checked={(selectedFilters.type_of_institute as string[]).includes(
                        formatForUrl(type.value ?? "")
                      )}
                      onChange={() =>
                        handleLocalFilterChange(
                          "type_of_institute",
                          type.value ?? ""
                        )
                      }
                    />
                    <span>
                      {type.value} ({type.count})
                    </span>
                  </label>
                ))}
          </>
          <>
            <h3 className="font-medium">Fee Range</h3>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <SkeletonFilterItem key={index} />
              ))
            ) : (
              feeRanges.map((range) => (
                <label
                  key={range.value}
                  className="flex items-center space-x-2 text-sm font-public"
                >
                  <input
                    type="checkbox"
                    checked={(selectedFilters.fee_range as string[]).includes(
                      range.value
                    )}
                    onChange={() =>
                      handleLocalFilterChange("fee_range", range.value)
                    }
                  />
                  <span>{range.label}</span>
                </label>
              ))
            )}
          </>
        </div>
      </div>
    );
  }
);

export default CollegeFilter;