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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College Name with Suggestions */}
            <div className="space-y-2">
              <Label
                htmlFor="collegeName"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <GraduationCap className="w-4 h-4 text-teal-500" />
                College Name <span className="text-teal-600">*</span>
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

            {/* College Location */}
            <div className="space-y-2">
              <Label
                htmlFor="collegeLocation"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <MapPin className="w-4 h-4 text-teal-500" />
                College Location <span className="text-teal-600">*</span>
              </Label>
              <Controller
                name="collegeLocation"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="collegeLocation"
                    placeholder="Enter college location"
                    className={`border-gray-300 ${
                      errors.collegeLocation ? "border-red-500" : ""
                    }`}
                    readOnly={!!selectedCollege}
                  />
                )}
              />
              {errors.collegeLocation && (
                <p className="text-sm text-red-600">
                  {errors.collegeLocation.message as string}
                </p>
              )}
            </div>

            {/* Course Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="w-4 h-4 text-teal-500" />
                Course Name <span className="text-teal-600">*</span>
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

            {/* Graduation Year */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-teal-500" />
                Graduation Year <span className="text-teal-600">*</span>
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
        {/* Review Title */}
        <div className="space-y-2">
          <Label className="text-xl font-semibold text-gray-800">
            Give Your Review a Title
          </Label>
          <Controller
            name="collegePlacementTitle"
            control={control}
            render={({ field }) => (
              <Input
                id="reviewTitle"
                {...field}
                placeholder="E.g. One of the best colleges for placements"
                className="border-gray-300"
              />
            )}
          />
          {errors.collegePlacementTitle && (
            <p className="text-sm text-red-500">
              {errors.collegePlacementTitle.message as string}
            </p>
          )}
        </div>

        {/* College Admission Process */}
        <div className="">
          <div className="space-y-2">
            <Label className="text-xl font-semibold text-gray-800">
              How was your college admission experience, and what should future
              applicants know?
            </Label>
            <div className="text-sm text-gray-600">
              <span className="block">• Eligibility & course requirements</span>
              <span className="block">
                • Mode of admission (exam, direct, quota)
              </span>
              <span className="block">• Course Fees</span>
              <span className="block">• Application Process</span>
            </div>
            <Controller
              name="admissionExperienceComment"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Write a message..."
                  className="min-h-[100px] border-gray-300"
                />
              )}
            />
            {errors.admissionExperienceComment && (
              <p className="text-sm text-red-500">
                {errors.admissionExperienceComment.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("admissionExperienceComment") || "").length}/2500
              characters
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-teal-500 text-lg font-semibold">
              College Admission Process
            </span>
            <Controller
              name="collegeAdmissionRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.collegeAdmissionRating && (
              <p className="text-sm text-red-500">
                {errors.collegeAdmissionRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campus Experience */}
        <div className="">
          <div className="space-y-2">
            <Label className="text-xl font-semibold text-gray-800">
              How was your experience with the college's campus and resources?
            </Label>
            <span className="text-sm text-gray-600 space-y-1">
              <span className="block">• Classroom & learning tech</span>
              <span className="block">• Sports & extracurriculars</span>
              <span className="block">• Hostel/living experience (if any)</span>
              <span className="block">
                • Total fees paid (incl. hostel, etc.)
              </span>
            </span>
            <Controller
              name="campusExperienceComment"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Write a message..."
                  className="min-h-[100px] border-gray-300"
                />
              )}
            />
            {errors.campusExperienceComment && (
              <p className="text-sm text-red-500">
                {errors.campusExperienceComment.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("campusExperienceComment") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-teal-500 text-lg font-semibold">
              College Campus Experience
            </span>
            <Controller
              name="campusExperienceRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.campusExperienceRating && (
              <p className="text-sm text-red-500">
                {errors.campusExperienceRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* College Infrastructure */}
        <div className="">
          <div className="space-y-2">
            <Label className="text-xl font-semibold text-gray-800">
              How was your academic experience at the college?
            </Label>
            <span className="text-sm text-gray-600 space-y-1">
              <span className="block">
                • Exams, Curriculum relevance & value
              </span>
              <span className="block">
                • Faculty support and teaching quality
              </span>
            </span>
            <Controller
              name="academicExperienceComment"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Write a message..."
                  className="min-h-[100px] border-gray-300"
                />
              )}
            />
            {errors.academicExperienceComment && (
              <p className="text-sm text-red-500">
                {errors.academicExperienceComment.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("academicExperienceComment") || "").length}/2500
              characters
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-teal-500 text-lg font-semibold">
              Academic Quality
            </span>
            <Controller
              name="academicQualityRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.academicQualityRating && (
              <p className="text-sm text-red-500">
                {errors.academicQualityRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Academic Quality */}
        <div className="">
          <div className="space-y-2">
            <Label className="text-xl font-semibold text-gray-800">
              How did your college contribute to your placement journey?
            </Label>
            <span className="text-sm text-gray-600 space-y-1">
              <span className="block">• Companies that visited</span>
              <span className="block">• Support from the placement cell</span>
              <span className="block">• Average & highest salary</span>
              <span className="block">
                • Number of recruiters & placed students
              </span>
            </span>
            <Controller
              name="placementJourneyComment"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Write a message..."
                  className="min-h-[100px] border-gray-300"
                />
              )}
            />
            {errors.placementJourneyComment && (
              <p className="text-sm text-red-500">
                {errors.placementJourneyComment.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("placementJourneyComment") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-teal-500 text-lg font-semibold">
              College Placement
            </span>
            <Controller
              name="placementJourneyRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.placementJourneyRating && (
              <p className="text-sm text-red-500">
                {errors.placementJourneyRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* College Images */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Camera className="w-4 h-4" />
            Share College Images
          </Label>
          <Controller
            name="collegeImages"
            control={control}
            render={({ field }) => (
              <ImageUpload
                images={field.value || []}
                onImagesChange={(images) => field.onChange(images)}
                maxImages={6}
              />
            )}
          />
          {errors.collegeImages && (
            <p className="text-sm text-red-500">
              {errors.collegeImages.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
