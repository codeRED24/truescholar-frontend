"use client";

import { useCallback, useState, useEffect } from "react";
import { LuX as X } from "react-icons/lu";
import {
  getCollegeCutoffsFilter,
  getCollegeFilteredCutoffs,
} from "@/api/individual/getIndividualCollege";

interface CutoffFilterProps {
  collegeId: number;
  examId: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedCategory: string;
  selectedFilters: Record<string, string | null>;
  onFiltersChange: (filters: Record<string, string | null>) => void;
  onCategoryChange: (category: string) => void;
  defaultFilters: Record<string, string | null>;
  filterData: Record<string, string[]>;
  setExamsWiseCutoff: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, Record<number, number | null>>>>
  >;
  onResetPage?: () => void;
}

const CutoffFilter = ({
  collegeId,
  examId,
  isOpen,
  setIsOpen,
  selectedCategory,
  selectedFilters,
  onFiltersChange,
  onCategoryChange,
  defaultFilters,
  filterData,
  setExamsWiseCutoff,
  onResetPage,
}: CutoffFilterProps) => {
  const [localFilterData, setLocalFilterData] = useState<Record<string, string[]>>(filterData);
  const [tempFilters, setTempFilters] = useState<Record<string, string | null>>(selectedFilters);
  const [isVisible, setIsVisible] = useState(isOpen);

  const FIXED_CATEGORY_ORDER = ["category", "quota", "round", "gender"];

  useEffect(() => {
    setLocalFilterData(filterData);
  }, [filterData]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const mapApiResponse = (response: any): Record<string, string[]> => {
    const newFilters: Record<string, string[]> = {};
    if (response && Array.isArray(response.filter_section) && response.filter_section.length) {
      const sections = response.filter_section[0];
      for (const key in sections) {
        if (Array.isArray(sections[key])) {
          const formattedKey = key.replace(/_section$/, "");
          newFilters[formattedKey] = sections[key].map((item: any) =>
            typeof item === "object" && item !== null ? item.label || item.value || JSON.stringify(item) : item
          );
        }
      }
    }
    return newFilters;
  };

  const handleOptionChange = useCallback(
    async (category: string, option: string) => {
      const updatedFilters = { ...tempFilters, [category]: option || null };
      setTempFilters(updatedFilters);

      let queryString = `exam_id=${examId}&${category.toLowerCase()}_section=${encodeURIComponent(option)}`;

      try {
        const response = await getCollegeCutoffsFilter(collegeId, queryString);
        const mappedFilters = mapApiResponse(response);

        setLocalFilterData((prev) => {
          const updatedData = { ...prev };
          for (const key in mappedFilters) {
            if (key !== category && mappedFilters[key]?.length > 0) {
              updatedData[key] = mappedFilters[key];
              if (tempFilters[key] && !mappedFilters[key].includes(tempFilters[key])) {
                updatedFilters[key] = mappedFilters[key][0];
              }
            }
          }
          return updatedData;
        });
        
        setTempFilters(updatedFilters);
      } catch (error) {
        console.error("Error fetching dependent filters:", error);
      }
    },
    [examId, collegeId, tempFilters]
  );

  const handleApply = async () => {
    try {
      let queryString = `exam_id=${examId}&page=1`;
      Object.entries(tempFilters).forEach(([category, value]) => {
        if (value) {
          queryString += `&${category.toLowerCase()}_section=${encodeURIComponent(value)}`;
        }
      });
  
      const response = await getCollegeFilteredCutoffs(collegeId, queryString);
  
      if (!response.cutoffs || response.cutoffs.length === 0) {
        setExamsWiseCutoff((prev) => ({
          ...prev,
          [Number(examId)]: {},
        }));
      } else {
        const extractedData = response.cutoffs.map((cutoff: any) => ({
          examId: response.applied_filters.exam_id,
          courseName: cutoff.course_full_name,
          ranks: cutoff.ranks,
        }));
  
        const transformedData = extractedData.reduce(
          (acc: Record<string, Record<number, number | null>>, item: any) => {
            acc[item.courseName] = item.ranks;
            return acc;
          },
          {}
        );
  
        setExamsWiseCutoff((prev) => ({
          ...prev,
          [Number(examId)]: transformedData,
        }));
      }
  
      onFiltersChange(tempFilters);
      setIsOpen(false);
      if (onResetPage) onResetPage();
    } catch (error) {
      console.error("Error fetching filtered cutoffs:", error);
      setExamsWiseCutoff((prev) => ({
        ...prev,
        [Number(examId)]: {},
      }));
      onFiltersChange(tempFilters);
      setIsOpen(false);
      if (onResetPage) onResetPage();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 transition-opacity"
      onClick={() => setIsOpen(false)}
    >
      <div
        className={`bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:w-[44rem] max-w-full flex flex-col md:relative 
        transition-all transform md:scale-100 h-[70vh] md:h-auto overflow-x-auto md:p-6 p-3 absolute bottom-0
        md:max-h-[80vh] ${isOpen ? "animate-slide-up md:animate-slideIn" : "animate-slideOut md:animate-slideOut"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-between border-b pb-2">
          <div className="flex justify-between">
            <h1 className="text-lg md:text-xl font-semibold">All Filters</h1>
            <button onClick={() => setIsOpen(false)} className="text-xl text-gray-600" title="Close">
              <X className="hover:scale-110 transition-all duration-300 hover:text-black" />
            </button>
          </div>
          <div className="scrollbar-thin-custom flex gap-2 md:my-4 my-2 overflow-x-auto whitespace-nowrap">
            {Object.entries(tempFilters).map(([category, option]) =>
              option ? (
                <span key={category} className="bg-primary-1 text-black py-1 px-2 rounded-full text-sm flex items-center">
                  {option}
                </span>
              ) : null
            )}
          </div>
        </div>

        <div className="flex w-full gap-4 flex-1 overflow-hidden">
          <div className="w-1/3 border-r-2 overflow-y-auto">
            <ul>
              {FIXED_CATEGORY_ORDER.map((category) =>
                localFilterData[category]?.length > 0 ? (
                  <li
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`mt-2 cursor-pointer capitalize p-2 font-semibold border-l-4 flex justify-between items-center ${
                      selectedCategory === category
                        ? "bg-primary-1 border-l-4 border-primary-main"
                        : "hover:bg-gray-100 border-transparent"
                    }`}
                  >
                    <span>{category}</span>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          <div className="w-2/3 min-h-[50vh] max-h-[50vh] md:min-h-96 md:max-h-96 overflow-y-auto md:px-2 scrollbar-thin-custom">
            {selectedCategory && localFilterData[selectedCategory]?.length > 0 ? (
              localFilterData[selectedCategory].map((option) => (
                <div key={option} className="my-3 flex items-center gap-2">
                  <input
                    type="radio"
                    id={option}
                    name={selectedCategory}
                    value={option}
                    checked={tempFilters[selectedCategory] === option}
                    onChange={() => handleOptionChange(selectedCategory, option)}
                    className="form-radio"
                  />
                  <label htmlFor={option} className="text-sm text-gray-500">
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No options available for this category.</p>
            )}
          </div>
        </div>

        <div className="flex md:justify-end justify-center border-t-2 p-2 gap-3">
          <button
            onClick={() => {
              setTempFilters(defaultFilters);
              setLocalFilterData(filterData);
              if (onResetPage) onResetPage();
            }}
            className="w-36 border-black border hover:bg-gray-300 text-gray-800 rounded-full text-sm px-1 py-2"
          >
            Reset
          </button>
          <button
            onClick={async () => {
              await handleApply();
            }}
            className="w-36 bg-black text-white hover:opacity-90 rounded-full text-sm px-1 py-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default CutoffFilter;