"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LuSearch as Search } from "react-icons/lu";
import { FaClock } from "react-icons/fa";
import { PopularCourse } from "@/api/@types/college-info";
import { formatDuration } from "@/components/utils/utils";
import CourseCard from "@/components/cards/CourseCard";
import CollegeCourseFilter from "@/components/filters/CollegeCourseFilter";

interface CollegeCourseListProps {
  courseData: { groups: PopularCourse[] };
  courseFilter?: Record<string, { label: string }[]>;
  paramsFilter: Record<string, string[]>;
  collegeId: number;
}

const NewCollegeCourseList: React.FC<CollegeCourseListProps> = ({
  courseData,
  courseFilter = {},
  paramsFilter,
  collegeId,
}) => {
  const [filteredData, setFilteredData] = useState<PopularCourse[]>(courseData.groups || []);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string[]>>(paramsFilter || {});
  const [filtersData, setFiltersData] = useState<Record<string, { label: string }[]>>(courseFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiltersCount, setSelectedFiltersCount] = useState<number>(0);

  const defaultOpenGroup = useMemo(
    () => (courseData.groups.length > 0 ? `group-${courseData.groups[0].course_group_id}` : ""),
    [courseData.groups]
  );

  useEffect(() => {
    setFilters(paramsFilter);
  }, [paramsFilter]);

  useEffect(() => {
    const count = Object.values(filters).reduce((acc, curr) => acc + curr.length, 0);
    setSelectedFiltersCount(count);
  }, [filters]);

  const filterCourses = useCallback(() => {
    let filtered = [...(courseData.groups || [])];

    if (filters.stream?.length) {
      filtered = filtered.filter((group) => filters.stream.includes(String(group.stream_id)));
    }

    if (filters.duration?.length) {
      filtered = filtered.filter((group) => {
        const months = group.duration_in_months || 0;
        return filters.duration.some((dur) => {
          switch (dur.toLowerCase()) {
            case "below 1 year":
              return months < 12;
            case "1-2 years":
              return months >= 12 && months < 24;
            case "2-3 years":
              return months >= 24 && months < 36;
            case "3-4 years":
              return months >= 36 && months < 48;
            case "4+ years":
              return months >= 48;
            default:
              return false;
          }
        });
      });
    }

    if (filters.level?.length) {
      filtered = filtered.filter((group) => filters.level.includes(group.level || ""));
    }

    setFilteredData(filtered);
  }, [courseData.groups, filters]);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const handleApplyFilters = useCallback(
    (appliedFilters: Record<string, string[]>) => {
      setFilters(appliedFilters);
      setIsFilterOpen(false);
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, values]) => {
        if (values.length) {
          params.set(key, values.join(","));
        }
      });
      window.history.pushState({}, "", `${window.location.pathname}?${params}`);
    },
    []
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleClear = useCallback(() => setSearchTerm(""), []);

  const filteredCourses = useMemo(
    () =>
      filteredData.flatMap((group) =>
        group.courses.filter((course) =>
          course.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    [filteredData, searchTerm]
  );

  const handleRemoveFilter = useCallback(
    (filterKey: string, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev };
        updated[filterKey] = updated[filterKey].filter((v) => v !== value);
        if (updated[filterKey].length === 0) {
          delete updated[filterKey];
        }
        handleApplyFilters(updated);
        return updated;
      });
    },
    [handleApplyFilters]
  );

  return (
    <div className="article-content-body">
      <div className="relative mb-4">
        <input
          type="text"
          className="pl-12 w-full h-10 border border-gray-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-3 focus:border-primary-3"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Search
          color="#828282"
          className="h-5 w-5 absolute top-1/2 left-4 transform -translate-y-1/2"
        />
        {searchTerm && (
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={handleClear}
          >
            Clear
          </button>
        )}
      </div>

      <button
        onClick={() => {
          setIsFilterOpen(true);
        }}
        className="mb-4 px-4 py-2 bg-primary-2 text-black rounded-full hover:bg-primary-3 transition-colors"
      >
        Filters {selectedFiltersCount > 0 && `(${selectedFiltersCount})`}
      </button>

      <CollegeCourseFilter
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        courseFilter={filtersData}
        onApplyFilters={handleApplyFilters}
        initialSelectedFilters={filters}
        selectedCategory={null}
        collegeId={collegeId}
        setFiltersData={setFiltersData}
        setSelectedFiltersCount={setSelectedFiltersCount}
      />

      {selectedFiltersCount > 0 && (
        <div className="flex gap-2 flex-wrap mt-2 mb-4">
          {Object.entries(filters).flatMap(([key, values]) =>
            values.map((value) => (
              <span
                key={`${key}-${value}`}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm flex items-center"
              >
                {value}
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFilter(key, value)}
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      )}

      {searchTerm === "" ? (
        filteredData.length > 0 ? (
          <Accordion type="single" defaultValue={defaultOpenGroup} collapsible className="w-full">
            {filteredData.map((group) => (
              <AccordionItem
                key={group.course_group_id}
                value={`group-${group.course_group_id}`}
                className="border-b mb-2 rounded-2xl bg-gray-1"
              >
                <AccordionTrigger className="p-4 hover:bg-gray-2">
                  <div className="w-full text-left">
                    <h3 className="text-lg font-semibold">
                      {group.course_group_full_name}{" "}
                      <span className="font-normal"> ({group.course_group_name})</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <FaClock />
                      <span>{formatDuration(group.duration_in_months)}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  {group.courses.length > 0 ? (
                    group.courses.map((course, index) => (
                      <CourseCard key={course.college_wise_course_id || index} course={course} />
                    ))
                  ) : (
                    <p className="text-gray-500">No courses available in this group</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-gray-500">No courses available</p>
        )
      ) : filteredCourses.length > 0 ? (
        <div className="flex flex-col gap-3 mt-2">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course.college_wise_course_id || index} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No courses found matching your search</p>
      )}
    </div>
  );
};

export default NewCollegeCourseList;