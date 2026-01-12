"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface FilterOption {
  value: string;
  count: number;
}

interface FilterOptions {
  mode_of_exam: FilterOption[];
  exam_streams: FilterOption[];
  level_of_exam: FilterOption[];
}

interface ExamFiltersProps {
  onFilterChange: (filters: {
    mode: string[];
    streams: string[];
    level: string[];
  }) => void;
  initialFilters: {
    mode: string[];
    streams: string[];
    level: string[];
  };
  isMobileDrawer?: boolean;
}

const ExamFilters: React.FC<ExamFiltersProps> = React.memo(
  ({ onFilterChange, initialFilters, isMobileDrawer = false }) => {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
      mode_of_exam: [],
      exam_streams: [],
      level_of_exam: [],
    });
    const [selectedFilters, setSelectedFilters] = useState(initialFilters);
    const [expandedSections, setExpandedSections] = useState<
      Record<string, boolean>
    >({
      category: true,
      mode: false,
      level: false,
      sortBy: false,
    });

    // Debounce timer ref
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Update selected filters when initialFilters change (e.g., from URL parsing)
    useEffect(() => {
      setSelectedFilters(initialFilters);
    }, [initialFilters]);

    useEffect(() => {
      const fetchFilters = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

          if (!API_URL || !BEARER_TOKEN)
            throw new Error("Missing API configuration");

          const response = await fetch(`${API_URL}/exams/exam-filters`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${BEARER_TOKEN}`,
              "Content-Type": "application/json",
            },
            next: {
              revalidate: 60 * 30,
            },
          });

          if (!response.ok) throw new Error("Failed to fetch filters");

          const { status, data } = await response.json();
          if (status === "success") setFilterOptions(data);
        } catch (error) {
          console.error("Failed to fetch filters:", error);
        }
      };

      fetchFilters();
    }, []);

    // Debounced effect to call onFilterChange
    useEffect(() => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Only debounce for mobile drawer to prevent rapid URL updates
      if (isMobileDrawer) {
        debounceTimerRef.current = setTimeout(() => {
          onFilterChange(selectedFilters);
        }, 300); // 300ms debounce delay
      } else {
        // For desktop, apply filters immediately
        onFilterChange(selectedFilters);
      }

      // Cleanup
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [selectedFilters, onFilterChange, isMobileDrawer]);

    const handleFilterChange = useCallback(
      (type: keyof typeof selectedFilters, value: string) => {
        // Helper function to normalize values for comparison
        const normalizeValue = (val: string) =>
          val.toLowerCase().replace(/[^a-z0-9]/g, "");

        setSelectedFilters((prev) => {
          const normalizedValue = normalizeValue(value);
          const isAlreadySelected = prev[type].some(
            (selectedValue) => normalizeValue(selectedValue) === normalizedValue
          );

          const updatedValues = isAlreadySelected
            ? prev[type].filter(
                (item) => normalizeValue(item) !== normalizedValue
              )
            : [...prev[type], value];

          return { ...prev, [type]: updatedValues };
        });
      },
      []
    );

    const clearAllFilters = useCallback(() => {
      setSelectedFilters({
        mode: [],
        streams: [],
        level: [],
      });
    }, []);

    const renderFilterSection = (
      title: string,
      options: FilterOption[],
      type: keyof typeof selectedFilters,
      sectionKey: string
    ) => {
      // Helper function to normalize values for comparison
      const normalizeValue = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, "");

      const isExpanded = expandedSections[sectionKey];

      return (
        <div className="border-b border-gray-200 last:border-b-0">
          <button
            className="w-full flex items-center justify-between py-4 text-left"
            onClick={() => {
              setExpandedSections((prev) => ({
                ...prev,
                [sectionKey]: !prev[sectionKey],
              }));
            }}
          >
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isExpanded && (
            <div className="pb-4 space-y-3 max-h-60 overflow-y-auto">
              {options?.map((option) => {
                // Check if this option is selected by comparing normalized values
                const isSelected = selectedFilters[type].some(
                  (selectedValue) =>
                    normalizeValue(selectedValue) ===
                    normalizeValue(option.value)
                );

                return (
                  <label
                    key={option.value}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      id={`${type}-${option.value}`}
                      checked={isSelected}
                      onChange={() => handleFilterChange(type, option.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                      {option.value}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({option.count})
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    const DesktopFilters = () => (
      <div className="w-80 bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)]">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Filter By</h2>
            <button
              onClick={clearAllFilters}
              className="text-sm text-neutral-500 font-medium flex items-center gap-1"
            >
              Reset
            </button>
          </div>
        </div>
        <div
          className="p-4 space-y-0 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          {renderFilterSection(
            "Category of Exams",
            filterOptions.exam_streams,
            "streams",
            "category"
          )}
          {renderFilterSection(
            "Mode of Exams",
            filterOptions.mode_of_exam,
            "mode",
            "mode"
          )}
          {renderFilterSection(
            "Level of Exams",
            filterOptions.level_of_exam,
            "level",
            "level"
          )}
        </div>
      </div>
    );

    // For mobile drawer, render just the filter sections without wrapper
    if (isMobileDrawer) {
      return (
        <div className="space-y-0">
          {renderFilterSection(
            "Category",
            filterOptions.exam_streams,
            "streams",
            "category"
          )}
          {renderFilterSection(
            "Mode",
            filterOptions.mode_of_exam,
            "mode",
            "mode"
          )}
          {renderFilterSection(
            "Level",
            filterOptions.level_of_exam,
            "level",
            "level"
          )}
        </div>
      );
    }

    // Desktop view
    return <DesktopFilters />;
  }
);

ExamFilters.displayName = "ExamFilters";

export default ExamFilters;
