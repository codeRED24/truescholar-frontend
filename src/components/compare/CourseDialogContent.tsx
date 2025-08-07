import React, { useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";

type Course = {
  course_id: string | number;
  name?: string;
  course_name?: string;
};

interface Props {
  courses: Course[];
  onSelect: (id: string, courseName: string) => void;
  selected: string | null;
  onClose: () => void;
}

const CourseDialogContent: React.FC<Props> = ({
  courses,
  onSelect,
  selected,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200); // 200ms debounce
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const filtered = useMemo(
    () =>
      courses.filter((course) =>
        (course.name || course.course_name || "")
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      ),
    [courses, debouncedSearch]
  );

  const parentRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Height for each item
    overscan: 5,
  });

  // Restore focus if lost due to dropdown re-render
  React.useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
    }
  }, [filtered.length]);

  const handleCourseSelect = (course: Course) => {
    const courseName = course.name || course.course_name || "";
    console.log("Selected course:", course);
    // Use college_wise_course_id for selection
    onSelect(String((course as any).college_wise_course_id), courseName);
    onClose();
  };

  return (
    <div className="space-y-4 ">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search course..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm "
        autoFocus
      />
      <div ref={parentRef} className="max-h-96 overflow-auto rounded border">
        {filtered.length > 0 ? (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const course = filtered[virtualItem.index];
              const isSelected =
                String((course as any).college_wise_course_id) === selected;
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <Button
                    variant={"ghost"}
                    className={`h-full w-full justify-start text-left hover:text-primary-main  font-normal ${
                      isSelected
                        ? "text-primary-main bg-primary-1"
                        : "text-black"
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    {course.name || course.course_name}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            No courses found
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDialogContent;
