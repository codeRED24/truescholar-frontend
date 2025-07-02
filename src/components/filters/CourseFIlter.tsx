import React, { useMemo, useCallback } from "react";
import DropdownFilter from "../miscellaneous/DropdownFilter";

interface FilterOption {
  value: string;
  label: string;
}

interface CourseFilterProps {
  courseFilter?: {
    stream_section: Array<{ stream_id: string; stream_name: string }>;
    level_section: Array<{ level: string }>;
  };
  onFilterChange: (
    stream: number | null,
    duration: string | null,
    level: string | null
  ) => void;
  selectedStream: string | null;
  selectedDuration: string | null;
  selectedLevel: string | null;
}

const durations: FilterOption[] = [
  { value: "below 1 year", label: "Below 1 Year" },
  { value: "1-2 years", label: "1-2 Years" },
  { value: "2-3 years", label: "2-3 Years" },
  { value: "3-4 years", label: "3-4 Years" },
  { value: "4+ years", label: "4+ Years" },
];

const CourseFilter: React.FC<CourseFilterProps> = ({
  courseFilter = { stream_section: [], level_section: [] },
  onFilterChange,
  selectedStream,
  selectedDuration,
  selectedLevel,
}) => {
  const filterConfig = useMemo(
    () => ({
      stream: {
        options: courseFilter.stream_section.map((s) => ({
          value: s.stream_id,
          label: s.stream_name,
        })),
        selected: selectedStream,
        placeholder: "Select Stream",
        searchable: true,
      },
      duration: {
        options: durations,
        selected: selectedDuration,
        placeholder: "Select Duration",
        searchable: false,
      },
      level: {
        options: courseFilter.level_section.map((l) => ({
          value: l.level,
          label: l.level,
        })),
        selected: selectedLevel,
        placeholder: "Select Level",
        searchable: false,
      },
    }),
    [courseFilter, selectedStream, selectedDuration, selectedLevel]
  );

  const handleSelect = useCallback(
    (type: keyof typeof filterConfig, value: string | null) => {
      const newFilters = {
        stream: selectedStream,
        duration: selectedDuration,
        level: selectedLevel,
        [type]: filterConfig[type].selected === value ? null : value,
      };

      onFilterChange(
        newFilters.stream ? Number(newFilters.stream) : null,
        newFilters.duration,
        newFilters.level
      );
    },
    [
      onFilterChange,
      selectedStream,
      selectedDuration,
      selectedLevel,
      filterConfig,
    ]
  );

  const handleClearFilters = useCallback(() => {
    onFilterChange(null, null, null);
  }, [onFilterChange]);

  const isFilterActive = selectedStream || selectedDuration || selectedLevel;

  return (
    <div className="my-4 flex flex-wrap gap-2">
      <DropdownFilter
        options={filterConfig.stream.options}
        selected={filterConfig.stream.selected}
        placeholder={filterConfig.stream.placeholder}
        searchable={filterConfig.stream.searchable}
        onSelect={(value) => handleSelect("stream", value)}
        
      />
      <DropdownFilter
        options={filterConfig.duration.options}
        selected={filterConfig.duration.selected}
        placeholder={filterConfig.duration.placeholder}
        onSelect={(value) => handleSelect("duration", value)}
      />
      <DropdownFilter
        options={filterConfig.level.options}
        selected={filterConfig.level.selected}
        placeholder={filterConfig.level.placeholder}
        onSelect={(value) => handleSelect("level", value)}
      />
      {isFilterActive && (
        <button
          className="px-4 py-2 rounded-full border border-red-500 text-red-500 hover:bg-red-100"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default CourseFilter;
