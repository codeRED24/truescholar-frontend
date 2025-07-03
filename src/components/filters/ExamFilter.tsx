"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { IoReloadSharp } from "react-icons/io5";
import { useIsMobile } from "../utils/useMobile";

interface FilterOption {
  value: string;
  count: number;
}

interface FilterOptions {
  exam_category: FilterOption[];
  exam_streams: FilterOption[];
  level_of_exam: FilterOption[];
}

interface ExamFiltersProps {
  onFilterChange: (filters: {
    // category: string[];
    streams: string[];
    level: string[];
  }) => void;
  initialFilters: {
    // category: string[];
    streams: string[];
    level: string[];
  };
}

const ExamFilters: React.FC<ExamFiltersProps> = React.memo(
  ({ onFilterChange, initialFilters }) => {
    const isMobile = useIsMobile();
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
      exam_category: [],
      exam_streams: [],
      level_of_exam: [],
    });
    const [selectedFilters, setSelectedFilters] = useState(initialFilters);

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
          });

          if (!response.ok) throw new Error("Failed to fetch filters");

          const { status, data } = await response.json();
          if (status === "success") setFilterOptions(data);
          // console.log({ data });
        } catch (error) {
          console.error("Failed to fetch filters:", error);
        }
      };

      fetchFilters();
    }, []);

    useEffect(() => {
      onFilterChange(selectedFilters);
    }, [selectedFilters, onFilterChange]);

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
        // category: [],
        streams: [],
        level: [],
      });
    }, []);

    const renderFilterSection = (
      title: string,
      options: FilterOption[],
      type: keyof typeof selectedFilters
    ) => {
      // Helper function to normalize values for comparison
      const normalizeValue = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, "");

      return (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {options?.map((option) => {
              // Check if this option is selected by comparing normalized values
              const isSelected = selectedFilters[type].some(
                (selectedValue) =>
                  normalizeValue(selectedValue) === normalizeValue(option.value)
              );

              return (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${type}-${option.value}`}
                    checked={isSelected}
                    onChange={() => handleFilterChange(type, option.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${type}-${option.value}`}
                    className="ml-2 text-sm text-gray-600"
                  >
                    {option.value} ({option.count})
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const DesktopFilters = () => (
      <div className="w-72 p-4 h-fit bg-white rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            onClick={clearAllFilters}
            className="text-sm hover:text-primary-main"
          >
            <IoReloadSharp />
          </button>
        </div>
        {/* {renderFilterSection(
          "Category",
          filterOptions.exam_category,
          "category"
        )} */}
        {renderFilterSection("Streams", filterOptions.exam_streams, "streams")}
        {renderFilterSection("Level", filterOptions.level_of_exam, "level")}
      </div>
    );

    const MobileFilters = () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <FilterIcon className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-4">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-500 hover:underline mb-4"
            >
              Clear All
            </button>
            {/* {renderFilterSection(
              "Category",
              filterOptions.exam_category,
              "category"
            )} */}
            {renderFilterSection(
              "Streams",
              filterOptions.exam_streams,
              "streams"
            )}
            {renderFilterSection("Level", filterOptions.level_of_exam, "level")}
          </div>
        </SheetContent>
      </Sheet>
    );

    return isMobile ? <MobileFilters /> : <DesktopFilters />;
  }
);

ExamFilters.displayName = "ExamFilters";

export default ExamFilters;
