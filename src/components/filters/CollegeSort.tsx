import React, { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

type SortOption = {
  label: string;
  value: string;
  sortFn: (a: any, b: any) => number;
};

const sortOptions: SortOption[] = [
  {
    label: "Recommended",
    value: "kapp_score_desc",
    sortFn: (a, b) => Number(b.kapp_score) - Number(a.kapp_score),
  },
  {
    label: "Rating (High - Low)",
    value: "rating_desc",
    sortFn: (a, b) => Number(b.kapp_rating) - Number(a.kapp_rating),
  },
  {
    label: "Fees (Low - High)",
    value: "min_fees_asc",
    sortFn: (a, b) => (Number(a.min_fees) || 0) - (Number(b.min_fees) || 0),
  },
  {
    label: "Fees (High - Low)",
    value: "max_fees_desc",
    sortFn: (a, b) => (Number(b.max_fees) || 0) - (Number(a.max_fees) || 0),
  },
];

interface CollegeSortProps {
  onSortChange: (sortFn: (a: any, b: any) => number) => void;
}

const CollegeSort: React.FC<CollegeSortProps> = ({ onSortChange }) => {
  const [selectedSort, setSelectedSort] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSortChange = (option: SortOption) => {
    setSelectedSort(option.value);
    onSortChange(option.sortFn);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-between w-full rounded-2xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedSort
            ? sortOptions.find((opt) => opt.value === selectedSort)?.label ||
              "Sort By"
            : "Sort By"}
          <IoChevronDown className="-mr-1 ml-2 h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`${
                  selectedSort === option.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100`}
                onClick={() => handleSortChange(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeSort;