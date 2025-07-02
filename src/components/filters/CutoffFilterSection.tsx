"use client";

import { useState, useCallback } from "react";
import { IoMdSwitch as Filter } from "react-icons/io";
import CutoffFilter from "./CutoffFilter";

interface CutoffFilterSectionProps {
  collegeId: number;
  examId: number;
  defaultFilters: {
    category: string;
    quota: string;
    round: string | null;
    gender: string | null;
  };
  filterData: {
    category: string[];
    quota: string[];
    round: string[];
    gender: string[];
  };
  onFiltersChange: (filters: Record<string, string | null>) => void;
  setExamsWiseCutoff: React.Dispatch<
    React.SetStateAction<Record<number, Record<string, Record<number, number | null>>>>
  >;
  onResetPage?: () => void; 
}

const CutoffFilterSection = ({
  collegeId,
  examId,
  defaultFilters,
  filterData,
  onFiltersChange,
  setExamsWiseCutoff,
  onResetPage,
}: CutoffFilterSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("category");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | null>>(defaultFilters);

  const openModalWithCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  }, []);

  const openModalWithDefault = useCallback(() => {
    setSelectedCategory("category");
    setIsModalOpen(true);
  }, []);

  const handleFiltersChange = useCallback(
    (filters: Record<string, string | null>) => {
      setSelectedFilters(filters);
      onFiltersChange(filters);
    },
    [onFiltersChange]
  );

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return (
    <>
      <div className="text-sm whitespace-nowrap overflow-x-auto flex gap-2 items-center">
        <button
          onClick={openModalWithDefault}
          className="font-public flex gap-1 items-center bg-white border rounded-2xl text-primary-main border-primary-main px-3 py-1 hover:bg-gray-100"
        >
          Filters
          {Object.entries(selectedFilters).filter(([_, option]) => option).length > 0 && (
            <span className="ml-1 text-xs bg-primary-main text-white rounded-full px-2 py-0.5">
              {Object.entries(selectedFilters).filter(([_, option]) => option).length}
            </span>
          )}
          <Filter />
        </button>

        {Object.entries(selectedFilters).map(([category, option]) =>
          option ? (
            <button
              key={category}
              onClick={() => openModalWithCategory(category)}
              className="capitalize font-public flex gap-1 items-center bg-white border rounded-2xl text-black border-black px-3 py-1 hover:bg-gray-100"
            >
              {category}: {option}
            </button>
          ) : null
        )}
      </div>

      <CutoffFilter
        collegeId={collegeId}
        examId={examId}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        selectedCategory={selectedCategory}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        onCategoryChange={handleCategoryChange}
        setExamsWiseCutoff={setExamsWiseCutoff}
        defaultFilters={defaultFilters}
        filterData={filterData}
        onResetPage={onResetPage}
      />
    </>
  );
};

export default CutoffFilterSection;