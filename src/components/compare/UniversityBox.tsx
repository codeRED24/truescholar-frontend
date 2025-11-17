"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

import CollegeSearchInput from "../compare/CollegeSearchInput";
import CourseDialogContent from "../compare/CourseDialogContent";
import { useEffect, useState } from "react";
import { useCollegeCourseCompare } from "@/hooks/useCollegeCourseCompare";
import { useOnlyCollegeIdCompare } from "@/hooks/useOnlyCollegeIdCompare";

export type UniversityBoxProps = {
  id?: number;
  selectedCollegeId?: string | null;
  selectedCollegeName?: string;
  setSelectedCollege?: (collegeId: string | null, collegeName: string) => void;
  selectedCourseId?: string | null;
  selectedCourseName?: string;
  setSelectedCourse?: (courseId: string | null, courseName: string) => void;
  setUniversityData: (data: any) => void;
  onDelete?: () => void;
  canDelete?: boolean;
};

export default function UniversityBox({
  selectedCollegeId,
  selectedCollegeName,
  setSelectedCollege,
  selectedCourseId,
  selectedCourseName,
  setSelectedCourse,
  setUniversityData,
  onDelete,
  canDelete = false,
}: UniversityBoxProps) {
  const { college, courses, loading } = useOnlyCollegeIdCompare(
    selectedCollegeId || null
  );
  const [selectedCourseLocal, setSelectedCourseLocal] = useState<string | null>(
    selectedCourseId || null
  );

  // Sync local state with prop when prop changes (e.g., after URL param parsing)
  useEffect(() => {
    setSelectedCourseLocal(selectedCourseId || null);
  }, [selectedCourseId]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handler for course selection
  const handleCourseChange = (courseId: string, courseName: string) => {
    setSelectedCourseLocal(courseId);
    if (setSelectedCourse) {
      setSelectedCourse(courseId, courseName);
    }
  };

  // Get the selected course name for display
  const getSelectedCourseName = () => {
    if (selectedCourseName) return selectedCourseName;
    if (selectedCourseLocal && courses.length > 0) {
      const courseObj = courses.find(
        (c: any) => String(c.college_id) === selectedCourseLocal
      );
      return courseObj?.college_name || courseObj?.course_name || "";
    }
    return "";
  };

  // Fetch college+course comparison when both are selected
  const {
    data: collegeCourseData,
    loading: courseCompareLoading,
    error: courseCompareError,
  } = useCollegeCourseCompare(
    selectedCollegeId || null,
    selectedCourseLocal || null
  );

  useEffect(() => {
    if (collegeCourseData) {
      setUniversityData(collegeCourseData);
    }
  }, [collegeCourseData]);

  useEffect(() => {
    if (college) {
      setUniversityData(college);
    }
  }, [college]);

  useEffect(() => {
    // Reset stream when university changes, but preserve if selectedStreamId is provided
    if (!selectedCourseId) {
      setSelectedCourseLocal(null);
      if (setSelectedCourse) {
        setSelectedCourse(null, "");
      }
    }
  }, [selectedCollegeId, courses]); // Remove setSelectedStream from dependencies
  return (
    <div
      className={`relative p-4`}
      style={{ paddingTop: canDelete && onDelete ? "1.5rem" : "1rem" }}
    >
      <CollegeSearchInput
        value={selectedCollegeName || ""}
        onChange={(name: string, collegeId?: string) => {
          if (setSelectedCollege) setSelectedCollege(collegeId || null, name);
        }}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            style={{ backgroundColor: "white" }}
            className="h-12 w-full justify-between text-left font-normal rounded-md"
            disabled={loading || (!courses.length && !!selectedCollegeId)}
          >
            <span className="truncate">
              {loading
                ? "Loading courses..."
                : selectedCourseLocal && getSelectedCourseName()
                ? getSelectedCourseName()
                : !courses.length && selectedCollegeId
                ? "N/A"
                : "Select Course"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Course</DialogTitle>
          </DialogHeader>
          <CourseDialogContent
            courses={courses}
            onSelect={handleCourseChange}
            selected={selectedCourseLocal}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
