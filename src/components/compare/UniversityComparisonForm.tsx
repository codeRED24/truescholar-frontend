"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import React, { useEffect, useState, useCallback, useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import UniversityBox from "./UniversityBox";
import UniInfoCard from "./UniInfoCard";
import {
  CourseComparisonTable,
  InstitutionComparisonTable,
  PlacementComparisonTable,
  RankingComparisonTable,
} from "./ComparisonTables";

export default function UniversityComparisonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [show, setshow] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Each university: { id: number, collegeId: string|null, collegeName: string|null }
  type University = {
    id: number;
    collegeId: string | null;
    collegeName: string;
    courseId: string | null;
    courseName: string | null;
    data: any | null;
  };

  const [universities, setUniversities] = useState<University[]>([
    {
      id: 1,
      collegeId: null,
      collegeName: "",
      courseId: null,
      courseName: "",
      data: null,
    },
    {
      id: 2,
      collegeId: null,
      collegeName: "",
      courseId: null,
      courseName: "",
      data: null,
    },
  ]);

  const addUniversity = () => {
    if (universities.length < 4) {
      setUniversities([
        ...universities,
        {
          id: Date.now(),
          collegeId: null,
          collegeName: "",
          courseId: null,
          courseName: "",
          data: null,
        },
      ]);
    }
  };

  const setUniversityData = useCallback((index: number, data: any) => {
    setUniversities((prev) =>
      prev.map((uni, i) => (i === index ? { ...uni, data } : uni))
    );
  }, []);

  const updateURL = useCallback(() => {
    // Clear any existing timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    // Debounce URL updates to avoid excessive calls
    urlUpdateTimeoutRef.current = setTimeout(() => {
      const params = universities
        .filter((uni) => uni.collegeId && uni.courseId)
        .map(
          (uni, idx) =>
            `college${idx + 1}=${encodeURIComponent(uni.collegeId!)}&course${
              idx + 1
            }=${encodeURIComponent(uni.courseId!)}`
        )
        .join("&");
      const url = `/compare-colleges${params ? `?${params}` : ""}`;
      console.log("Updating URL", { url });
      router.push(url, { scroll: false });
    }, 500); // 500ms debounce
  }, [universities, router]);

  const setSelectedUniversity = useCallback(
    (index: number, collegeId: string | null, collegeName: string) => {
      setUniversities((prev) =>
        prev.map((uni, i) =>
          i === index ? { ...uni, collegeId, collegeName } : uni
        )
      );
    },
    []
  );

  const setSelectedCourse = useCallback(
    (index: number, courseId: string | null, courseName: string) => {
      setUniversities((prev) =>
        prev.map((uni, i) =>
          i === index ? { ...uni, courseId, courseName } : uni
        )
      );
    },
    []
  );

  // Effect to update URL when universities change (with debounce)
  useEffect(() => {
    if (isInitialized) {
      updateURL();
    }
  }, [universities, isInitialized, updateURL]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Initialize state from URL parameters
  useEffect(() => {
    if (!isInitialized) {
      const initialUniversities: University[] = [];
      let hasUrlParams = false;

      // Parse URL parameters
      for (let i = 1; i <= 4; i++) {
        const collegeId = searchParams.get(`college${i}`);
        const courseId = searchParams.get(`course${i}`);

        if (collegeId || courseId) {
          hasUrlParams = true;
          initialUniversities.push({
            id: i,
            collegeId: collegeId || null,
            collegeName: "", // Will be populated when university data loads
            courseId: courseId || null,
            courseName: "", // Will be populated when university data loads
            data: null,
          });
        }
      }

      // Only update universities state if we found URL parameters
      if (hasUrlParams) {
        // Ensure at least 2 universities
        while (initialUniversities.length < 2) {
          initialUniversities.push({
            id: initialUniversities.length + 1,
            collegeId: null,
            collegeName: "",
            courseId: null,
            courseName: "",
            data: null,
          });
        }
        setUniversities(initialUniversities);
        setshow(true); // Show comparison when loaded from URL

        // Fetch college names for URL parameters
        initialUniversities.forEach(async (uni, index) => {
          if (uni.collegeId) {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/compare?college_id=${uni.collegeId}&course_id=${uni.courseId}`
              );
              const data = await response.json();
              if (data.success && data.data.college) {
                const collegeName = data.data.college.college_name;
                const courses = data.data.college?.CollegesCourses || [];

                // Find stream name if streamId exists
                let courseName = "";
                if (uni.courseId && courses.length > 0) {
                  const course = courses.find(
                    (s: any) =>
                      String(s.college_wise_course_id) === uni.courseId
                  );
                  courseName = course ? course.name : "";
                }

                // Update the university with fetched data
                setUniversities((prev) =>
                  prev.map((u, i) =>
                    i === index
                      ? {
                          ...u,
                          collegeName,
                          courseName,
                        }
                      : u
                  )
                );
              }
            } catch (error) {
              console.error("Error fetching college data:", error);
            }
          }
        });
      }

      setIsInitialized(true);
    }
  }, [isInitialized]); // Remove searchParams from dependencies to prevent infinite loop

  const deleteUniversity = (id: number) => {
    if (universities.length > 2) {
      setUniversities((prev) => prev.filter((uni) => uni.id !== id));
    }
  };

  useEffect(() => {
    console.log("University comparison form rendered", { universities });
  }, [universities]);

  const add = () => {
    addUniversity();
    setshow(false);
  };

  return (
    <div className="mb-16">
      {/* Single scroll container for all content */}
      <div className="overflow-x-auto pb-4">
        <div
          style={{
            minWidth: `${universities.length * 380}px`,
          }}
        >
          {/* University Selection */}
          <div
            className={`grid gap-4`}
            style={{
              gridTemplateColumns: `repeat(${universities.length}, minmax(370px, 1fr))`,
            }}
          >
            {universities.map((uni, idx) => (
              <UniversityBox
                key={uni.id}
                id={uni.id}
                selectedCollegeId={uni.collegeId}
                selectedCollegeName={uni.collegeName}
                selectedCourseId={uni.courseId}
                selectedCourseName={uni.courseName || undefined}
                setSelectedCollege={(
                  collegeId: string | null,
                  collegeName: string
                ) => setSelectedUniversity(idx, collegeId, collegeName)}
                setSelectedCourse={(
                  courseId: string | null,
                  courseName: string
                ) => setSelectedCourse(idx, courseId, courseName)}
                setUniversityData={(data: any) => setUniversityData(idx, data)}
                onDelete={() => deleteUniversity(uni.id)}
                canDelete={universities.length > 2}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col justify-end gap-4 sm:flex-row">
            {universities.length < 4 && (
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={add}
                disabled={universities.length >= 4}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add upto {4 - universities.length} universities
              </Button>
            )}
            <Button onClick={() => setshow(true)} className="h-12 px-8">
              Compare Now
            </Button>
          </div>

          {/* University Info Cards with VS separators */}
          {show && (
            <div className="mt-32 flex items-center gap-4">
              {universities.map((uni, idx) => (
                <React.Fragment key={uni.id}>
                  <UniInfoCard
                    university={uni}
                    canDelete={universities.length > 2}
                    onDelete={() => deleteUniversity(uni.id)}
                  />
                  {idx < universities.length - 1 && (
                    <div className="flex items-center justify-center">
                      <span className="bg-gray-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] text-base font-bold text-primary-2 shadow">
                        VS
                      </span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Comparison Content */}
          {show && (
            <div className="mt-8">
              <CourseComparisonTable universities={universities} />
              <InstitutionComparisonTable universities={universities} />
              <RankingComparisonTable universities={universities} />
              <PlacementComparisonTable universities={universities} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
