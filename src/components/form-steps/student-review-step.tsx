"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "@/components/form-provider";
import { StarRating } from "@/components/star-rating";
import { ImageUpload } from "@/components/image-upload";
import {
  Camera,
  GraduationCap,
  MapPin,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { useUniSearch } from "@/hooks/useUniSearch";
import { useOnlyCollegeIdCompare } from "@/hooks/useOnlyCollegeIdCompare";
import { useState, useCallback } from "react";

export function StudentReviewStep() {
  const { studentReviewForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = studentReviewForm;

  const selectedCollegeId = watch("collegeId");

  const { results, loading: searchLoading, search } = useUniSearch();
  const { courses, loading: coursesLoading } =
    useOnlyCollegeIdCompare(selectedCollegeId);

  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [collegeOptions, setCollegeOptions] = useState<any[]>([]);

  // Create fetchSuggestions function for SuggestionInput
  const fetchCollegeSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      try {
        const url = `${
          process.env.NEXT_PUBLIC_API_URL
        }/college-search?q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const colleges = data.data.colleges || [];

        // Store colleges for later use in selection
        setCollegeOptions(colleges);

        return colleges.map(
          (college: any) => college.college_name || college.name
        );
      } catch (error) {
        console.error("Error fetching college suggestions:", error);
        return [];
      }
    },
    []
  );

  // Function to get college by name from stored options
  const getCollegeByName = useCallback(
    (collegeName: string) => {
      return collegeOptions.find(
        (college: any) => (college.college_name || college.name) === collegeName
      );
    },
    [collegeOptions]
  );

  // Handle college selection
  const handleCollegeSelect = (collegeName: string) => {
    const college = getCollegeByName(collegeName);
    if (college) {
      setSelectedCollege(college);
      const collegeDisplayName = college.college_name || college.name;
      const collegeId = Number(college.college_id || college.id);
      const collegeLocation = college.location || college.city || "";

      setValue("collegeName", collegeDisplayName);
      setValue("collegeId", collegeId);
      setValue("collegeLocation", collegeLocation);
      // Reset course when college changes
      setValue("courseName", "");
      setValue("courseId", 0);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseValue: string) => {
    const course = courses.find(
      (c: any) =>
        c.college_wise_course_id != null &&
        c.college_wise_course_id.toString() === courseValue
    );
    if (course) {
      setValue("courseName", course.name);
      setValue("courseId", Number(course.college_wise_course_id));
    }
  };

  return (
    <div className="">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Student Review
      </h2>

      <div className="space-y-20">
        {/* College Information Section */}

        <div className="pt-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            College Information
          </h3>
          <div className="space-y-6">
            {/* Anonymous Feedback Toggle */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                Would you like to keep this feedback anonymous?
              </Label>
              <Controller
                name="isAnonymous"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="false"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="mr-2"
                      />
                      No
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...field}
                        value="true"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* College Name with Suggestions */}
              <div className="space-y-2">
                <Label
                  htmlFor="collegeName"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <GraduationCap className="w-4 h-4 text-teal-500" />
                  College/University Name{" "}
                  <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="collegeName"
                  control={control}
                  render={({ field }) => (
                    <SuggestionInput
                      value={field.value}
                      onChange={field.onChange}
                      onSelect={handleCollegeSelect}
                      fetchSuggestions={fetchCollegeSuggestions}
                      placeholder="Type to search for colleges..."
                      className={`border-gray-300 ${
                        errors.collegeName ? "border-red-500" : ""
                      }`}
                      minQueryLength={2}
                      debounceMs={300}
                    />
                  )}
                />
                {errors.collegeName && (
                  <p className="text-sm text-red-600">
                    {errors.collegeName.message as string}
                  </p>
                )}
              </div>

              {/* College Location - Hidden from UI but still populated */}
              <Controller
                name="collegeLocation"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="hidden" id="collegeLocation" />
                )}
              />

              {/* Current Course Enrolled */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 text-teal-500" />
                  Current Course Enrolled{" "}
                  <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="courseName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={
                        field.value
                          ? courses
                              .find(
                                (c: any) =>
                                  c.name === field.value &&
                                  c.college_wise_course_id != null
                              )
                              ?.college_wise_course_id?.toString() || ""
                          : ""
                      }
                      onValueChange={handleCourseSelect}
                      disabled={
                        !selectedCollegeId ||
                        selectedCollegeId === 0 ||
                        coursesLoading
                      }
                    >
                      <SelectTrigger
                        className={`border-gray-300 ${
                          errors.courseName ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            !selectedCollegeId || selectedCollegeId === 0
                              ? "Select a college first"
                              : coursesLoading
                              ? "Loading courses..."
                              : "Select course"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {courses && courses.length > 0 ? (
                          courses
                            .filter(
                              (course: any) =>
                                course.college_wise_course_id != null &&
                                course.name
                            )
                            .map((course: any) => (
                              <SelectItem
                                key={course.college_wise_course_id}
                                value={course.college_wise_course_id.toString()}
                              >
                                {course.name}
                              </SelectItem>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No courses available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.courseName && (
                  <p className="text-sm text-red-600">
                    {errors.courseName.message as string}
                  </p>
                )}
              </div>

              {/* Stream / Department */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  Stream / Department
                </Label>
                <Controller
                  name="stream"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select stream/department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer-science">
                          Computer Science
                        </SelectItem>
                        <SelectItem value="information-technology">
                          Information Technology
                        </SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="civil">Civil</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="chemical">Chemical</SelectItem>
                        <SelectItem value="biotechnology">
                          Biotechnology
                        </SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Year of Study */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  Year of Study
                </Label>
                <Controller
                  name="yearOfStudy"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Year</SelectItem>
                        <SelectItem value="2nd">2nd Year</SelectItem>
                        <SelectItem value="3rd">3rd Year</SelectItem>
                        <SelectItem value="4th">4th Year</SelectItem>
                        <SelectItem value="5th">5th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Mode of Study */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  Mode of Study
                </Label>
                <Controller
                  name="modeOfStudy"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  Current Semester
                </Label>
                <Controller
                  name="currentSemester"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                        <SelectItem value="5">Semester 5</SelectItem>
                        <SelectItem value="6">Semester 6</SelectItem>
                        <SelectItem value="7">Semester 7</SelectItem>
                        <SelectItem value="8">Semester 8</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Expected Graduation Year */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  Expected Graduation Year{" "}
                  <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="graduationYear"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      <SelectTrigger
                        className={`border-gray-300 ${
                          errors.graduationYear ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => 2020 + i).map(
                          (year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.graduationYear && (
                  <p className="text-sm text-red-600">
                    {errors.graduationYear.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
