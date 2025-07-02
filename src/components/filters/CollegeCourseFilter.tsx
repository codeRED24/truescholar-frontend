"use client";

import { getCollegeFilters } from "@/api/individual/getIndividualCollege";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { LuX as X } from "react-icons/lu";
import { FilterSection } from "@/api/@types/college-info";

interface FilterItem {
  name: string;
  value: string;
}

interface CollegeCourseFilterProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  courseFilter: FilterSection["filter_section"];
  onApplyFilters: (filters: Record<string, string[]>) => void;
  initialSelectedFilters: Record<string, string[]>;
  selectedCategory: string | null;
  collegeId: number;
  setFiltersData: React.Dispatch<React.SetStateAction<Record<string, { label: string }[]>>>;
  setSelectedFiltersCount: (count: number) => void;
}

const CollegeCourseFilter: React.FC<CollegeCourseFilterProps> = ({
  isOpen,
  setIsOpen,
  courseFilter,
  onApplyFilters,
  initialSelectedFilters,
  selectedCategory: initialSelectedCategory,
  collegeId,
  setFiltersData,
  setSelectedFiltersCount,
}) => {
  const router = useRouter();
  const [validCategories, setValidCategories] = useState<[string, FilterItem[]][]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  console.log("courseFilter in CollegeCourseFilter:", courseFilter);
  console.log("validCategories:", validCategories);

  const transformFilterItems = useCallback((items: Array<{ label: string }>): FilterItem[] => {
    return items.map((item) => ({ name: item.label, value: item.label }));
  }, []);

  const getQueryParams = useCallback(() => {
    if (typeof window === "undefined") return {};
    const params = new URLSearchParams(window.location.search);
    const filters: Record<string, string[]> = {};
    params.forEach((value, key) => {
      filters[key] = value.split(",");
    });
    return filters;
  }, []);

  useEffect(() => {
    const queryParams = getQueryParams();
    const initialOptions = new Set<string>();
    Object.values(queryParams).forEach((options) => options.forEach((option) => initialOptions.add(option)));
    Object.values(initialSelectedFilters).forEach((options) =>
      options.forEach((option) => initialOptions.add(option))
    );
    setSelectedOptions(initialOptions);
  }, [initialSelectedFilters, getQueryParams]);

  useEffect(() => {
    setSelectedFiltersCount(selectedOptions.size);
  }, [selectedOptions, setSelectedFiltersCount]);

  useEffect(() => {
    const fetchInitialFilters = async () => {
      const queryParams = getQueryParams();
      try {
        const dataFormatted = Object.entries(queryParams)
          .map(([key, values]) => `${key}=${values.join(",")}`)
          .join("&");
        const output = (await getCollegeFilters(collegeId, dataFormatted)) as FilterSection;

        const transformedOutput: Record<string, { label: string }[]> = {};
        Object.entries(output.filter_section).forEach(([key, items]) => {
          transformedOutput[key] = items.map((item) => ({ label: item.label }));
        });
        setFiltersData(transformedOutput);

        const newValidCategories = Object.entries(output.filter_section)
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => [category, transformFilterItems(items)] as [string, FilterItem[]]);
        setValidCategories(newValidCategories);

        if (!selectedCategory && newValidCategories.length > 0) {
          setSelectedCategory(newValidCategories[0][0]);
        }
      } catch (err) {
        console.error("Error fetching initial filters:", err);
        setError("Failed to load filters. Please try again.");
      }
    };

    if (Object.keys(getQueryParams()).length > 0) {
      fetchInitialFilters();
    }
  }, [collegeId, setFiltersData, transformFilterItems, getQueryParams]);

  useEffect(() => {
    if (!courseFilter || typeof courseFilter !== "object") {
      setValidCategories([]);
      setSelectedCategory(null);
      return;
    }

    const validCategoriesFiltered = Object.entries(courseFilter)
      .filter(([_, items]) => Array.isArray(items) && items.length > 0)
      .map(([category, items]) => [category, transformFilterItems(items)] as [string, FilterItem[]]);
    setValidCategories(validCategoriesFiltered);
    if (!validCategoriesFiltered.some(([cat]) => cat === selectedCategory)) {
      setSelectedCategory(validCategoriesFiltered[0]?.[0] || null);
    }
  }, [courseFilter, transformFilterItems]);

  useEffect(() => {
    if (isOpen && initialSelectedCategory) {
      setSelectedCategory(initialSelectedCategory);
    }
  }, [isOpen, initialSelectedCategory]);

  const updateFiltersAndFetch = useCallback(
    async (newSelection: Set<string>) => {
      try {
        setError(null);
        let dataFormatted = "";

        validCategories.forEach(([category, items], index) => {
          const processedCategory = category.replace(/_section$/, "");
          const selectedItems = items
            .filter((item) => newSelection.has(item.name))
            .map((item) => item.name);

          if (selectedItems.length > 0) {
            dataFormatted += `${index === 0 ? "" : "&"}${processedCategory}=${selectedItems.join(",")}`;
          }
        });

        const output = (await getCollegeFilters(collegeId, dataFormatted)) as FilterSection;
        const updatedFilterSections = { ...output.filter_section };
        if (selectedCategory && courseFilter[selectedCategory]) {
          updatedFilterSections[selectedCategory] = courseFilter[selectedCategory];
        }

        const transformedOutput: Record<string, { label: string }[]> = {};
        Object.entries(updatedFilterSections).forEach(([key, items]) => {
          transformedOutput[key] = items.map((item) => ({ label: item.label }));
        });
        setFiltersData(transformedOutput);

        const newValidCategories = Object.entries(updatedFilterSections)
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => [category, transformFilterItems(items)] as [string, FilterItem[]]);
        setValidCategories(newValidCategories);

        if (!newValidCategories.some(([cat]) => cat === selectedCategory)) {
          setSelectedCategory(newValidCategories[0]?.[0] || null);
        }
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError("Failed to update filters. Please try again.");
      }
    },
    [collegeId, courseFilter, selectedCategory, setFiltersData, transformFilterItems, validCategories]
  );

  const handleOptionChange = useCallback(
    async (option: string, e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const newSelection = new Set(selectedOptions);
      if (newSelection.has(option)) {
        newSelection.delete(option);
      } else {
        newSelection.add(option);
      }
      setSelectedOptions(newSelection);
      await updateFiltersAndFetch(newSelection);
    },
    [selectedOptions, updateFiltersAndFetch]
  );

  const handleRemoveOption = useCallback(
    async (option: string, e?: React.MouseEvent) => {
      e?.preventDefault();
      const newSelection = new Set(selectedOptions);
      newSelection.delete(option);
      setSelectedOptions(newSelection);
      await updateFiltersAndFetch(newSelection);
    },
    [selectedOptions, updateFiltersAndFetch]
  );

  const handleClearFilters = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      const newSelection = new Set<string>();
      setSelectedOptions(newSelection);
      try {
        setError(null);
        const output = (await getCollegeFilters(collegeId, "")) as FilterSection;

        const transformedOutput: Record<string, { label: string }[]> = {};
        Object.entries(output.filter_section).forEach(([key, items]) => {
          transformedOutput[key] = items.map((item) => ({ label: item.label }));
        });
        setFiltersData(transformedOutput);

        const newValidCategories = Object.entries(output.filter_section)
          .filter(([_, items]) => items.length > 0)
          .map(([category, items]) => [category, transformFilterItems(items)] as [string, FilterItem[]]);
        setValidCategories(newValidCategories);
        setSelectedCategory(newValidCategories[0]?.[0] || null);
      } catch (err) {
        console.error("Error resetting filters:", err);
        setError("Failed to reset filters. Please try again.");
      }
    },
    [collegeId, setFiltersData, transformFilterItems]
  );

  const handleApplyFilters = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const filtersByCategory: Record<string, string[]> = {};
      let dataFormatted = "";

      validCategories.forEach(([category, items], index) => {
        const processedCategory = category.replace(/_section$/, "");
        const selectedItems = items
          .filter((item) => selectedOptions.has(item.name))
          .map((item) => item.name);

        if (selectedItems.length > 0) {
          dataFormatted += `${index === 0 ? "" : "&"}${processedCategory}=${selectedItems.join(",")}`;
          filtersByCategory[processedCategory] = selectedItems;
        }
      });

      router.push(`?${dataFormatted}`);
      onApplyFilters(filtersByCategory);
      setIsOpen(false);
    },
    [validCategories, selectedOptions, router, onApplyFilters, setIsOpen]
  );

  const selectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    validCategories.forEach(([category, items]) => {
      counts[category] = items.reduce((acc, item) => (selectedOptions.has(item.name) ? acc + 1 : acc), 0);
    });
    return counts;
  }, [selectedOptions, validCategories]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 md:bg-opacity-50"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:w-[44rem] max-w-full flex flex-col h-[70vh] md:h-auto md:p-6 p-3 absolute bottom-0 md:static md:max-h-[80vh] overflow-y-auto animate-slide-up md:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col border-b pb-2">
          <div className="flex justify-between items-center">
            <h1 className="text-lg md:text-xl font-semibold">All Filters</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl text-gray-600 hover:text-gray-800"
              title="Close"
              aria-label="Close"
            >
              <X />
            </button>
          </div>

          {selectedOptions.size > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-thin">
              {Array.from(selectedOptions).map((option) => (
                <span
                  key={option}
                  className="bg-primary-2 text-black py-1 px-2 rounded-full whitespace-nowrap text-sm flex items-center"
                >
                  {option.split("_")[0]}
                  <button
                    onClick={(e) => handleRemoveOption(option, e)}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                    title="Remove"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && <div className="my-2 text-red-500 text-sm">{error}</div>}

        <div className="flex w-full gap-4 flex-1 overflow-hidden mt-4">
          <div className="w-1/3 border-r-2 overflow-y-auto max-h-[50vh] md:max-h-96">
            <ul>
              {validCategories.length > 0 ? (
                validCategories.map(([category]) => (
                  <li
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`mt-2 cursor-pointer capitalize p-2 font-semibold text-black flex justify-between items-center border-l-4 ${
                      selectedCategory === category
                        ? "bg-primary-2 border-l-black"
                        : "hover:bg-primary-1 border-transparent"
                    }`}
                  >
                    <span>{category.split("_")[0]}</span>
                    {selectedCounts[category] > 0 && (
                      <span className="bg-primary-brand text-white text-xs px-2 py-0.5 rounded-full">
                        {selectedCounts[category]}
                      </span>
                    )}
                  </li>
                ))
              ) : (
                <li className="p-2 text-gray-500">No filters available</li>
              )}
            </ul>
          </div>

          <div className="w-2/3 max-h-[50vh] md:max-h-96 overflow-y-auto scrollbar-thin px-2">
            {selectedCategory &&
            validCategories.find(([cat]) => cat === selectedCategory)?.[1] ? (
              validCategories.find(([cat]) => cat === selectedCategory)![1].length > 0 ? (
                validCategories
                  .find(([cat]) => cat === selectedCategory)!
                  [1].filter((item) => item.name !== "Others")
                  .map((item) => (
                    <div key={item.name} className="my-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={item.name}
                        checked={selectedOptions.has(item.name)}
                        onChange={(e) => handleOptionChange(item.name, e)}
                        className="form-checkbox h-5 w-5 text-primary-brand"
                      />
                      <label htmlFor={item.name} className="text-sm md:text-md text-gray-700">
                        {item.name.split("_")[0]}
                      </label>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm md:text-md">No options available</p>
              )
            ) : (
              <p className="text-gray-500 text-sm md:text-md">Select a category to view options</p>
            )}
          </div>
        </div>

        <div className="flex md:justify-end justify-center border-t-2 p-2 gap-3 mt-4">
          <button
            onClick={handleClearFilters}
            className="w-36 border border-black text-gray-800 rounded-full text-sm px-4 py-2 hover:bg-gray-100"
          >
            Clear
          </button>
          <button
            onClick={handleApplyFilters}
            className="w-36 bg-black text-white rounded-full text-sm px-4 py-2 hover:bg-gray-800"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeCourseFilter;