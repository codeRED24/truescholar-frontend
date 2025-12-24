"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useReviewForm } from "../form-provider";
import { GraduationCap, BookOpen, Calendar, IndianRupee } from "lucide-react";
import { Controller } from "react-hook-form";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { useOnlyCollegeIdCompare } from "@/hooks/useOnlyCollegeIdCompare";
import { useState, useCallback } from "react";

export function AcademicStep() {
  const { academicForm } = useReviewForm();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = academicForm;

  const selectedCollegeId = watch("collegeId");
  const scholarshipAvailed = watch("scholarshipAvailed");
  const { courses, loading: coursesLoading } = useOnlyCollegeIdCompare(
    selectedCollegeId ? String(selectedCollegeId) : null
  );
  const [collegeOptions, setCollegeOptions] = useState<any[]>([]);

  // Fetch college suggestions
  const fetchCollegeSuggestions = useCallback(
    async (query: string): Promise<string[]> => {
      if (!query || query.length < 2) return [];
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/college-search?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        const colleges = data.data.colleges || [];
        setCollegeOptions(colleges);
        return colleges.map((c: any) => c.college_name || c.name);
      } catch {
        return [];
      }
    },
    []
  );

  // Handle college selection
  const handleCollegeSelect = (name: string) => {
    const college = collegeOptions.find(
      (c) => (c.college_name || c.name) === name
    );
    if (college) {
      setValue("collegeName", college.college_name || college.name);
      setValue("collegeId", Number(college.college_id || college.id));
      setValue("collegeLocation", college.location || college.city || "");
      setValue("courseName", "");
      setValue("courseId", 0);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseValue: string) => {
    const course = courses.find(
      (c: any) => c.college_wise_course_id?.toString() === courseValue
    );
    if (course) {
      setValue("courseName", course.name);
      setValue("courseId", Number(course.college_wise_course_id));
    }
  };

  return (
    <div className="space-y-12">
      <h2 className="text-2xl font-semibold text-gray-900">
        Academic & Financial Information
      </h2>

      {/* College Information Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">
          College Information
        </h3>

        {/* Anonymous Toggle */}
        <Controller
          name="isAnonymous"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <Label>Keep feedback anonymous</Label>
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* College Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-teal-500" />
              College/University <span className="text-teal-600">*</span>
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
                  placeholder="Search for your college..."
                  minQueryLength={2}
                  debounceMs={300}
                />
              )}
            />
            {errors.collegeName && (
              <p className="text-sm text-red-600">
                {errors.collegeName.message}
              </p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500" />
              Course <span className="text-teal-600">*</span>
            </Label>
            <Controller
              name="courseName"
              control={control}
              render={({ field }) => (
                <Select
                  value={
                    courses
                      .find((c: any) => c.name === field.value)
                      ?.college_wise_course_id?.toString() || ""
                  }
                  onValueChange={handleCourseSelect}
                  disabled={!selectedCollegeId || coursesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedCollegeId
                          ? "Select college first"
                          : coursesLoading
                          ? "Loading..."
                          : "Select course"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {courses
                      .filter((c: any) => c.college_wise_course_id && c.name)
                      .map((c: any) => (
                        <SelectItem
                          key={c.college_wise_course_id}
                          value={c.college_wise_course_id.toString()}
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.courseName && (
              <p className="text-sm text-red-600">
                {errors.courseName.message}
              </p>
            )}
          </div>

          {/* Stream */}
          <SelectField
            name="stream"
            control={control}
            label="Stream / Department"
            options={[
              { value: "computer-science", label: "Computer Science" },
              {
                value: "information-technology",
                label: "Information Technology",
              },
              { value: "electronics", label: "Electronics" },
              { value: "mechanical", label: "Mechanical" },
              { value: "civil", label: "Civil" },
              { value: "electrical", label: "Electrical" },
              { value: "commerce", label: "Commerce" },
              { value: "arts", label: "Arts" },
              { value: "science", label: "Science" },
              { value: "management", label: "Management" },
              { value: "other", label: "Other" },
            ]}
          />

          {/* Year of Study */}
          <SelectField
            name="yearOfStudy"
            control={control}
            label="Year of Study"
            options={["1st", "2nd", "3rd", "4th", "5th"].map((y) => ({
              value: y,
              label: `${y} Year`,
            }))}
          />

          {/* Mode of Study */}
          <SelectField
            name="modeOfStudy"
            control={control}
            label="Mode of Study"
            options={[
              { value: "full-time", label: "Full-time" },
              { value: "part-time", label: "Part-time" },
              { value: "distance", label: "Distance" },
              { value: "online", label: "Online" },
            ]}
          />

          {/* Current Semester */}
          <SelectField
            name="currentSemester"
            control={control}
            label="Current Semester"
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i + 1),
              label: `Semester ${i + 1}`,
            }))}
          />

          {/* Graduation Year */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              Graduation Year <span className="text-teal-600">*</span>
            </Label>
            <Controller
              name="graduationYear"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => 2020 + i).map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.graduationYear && (
              <p className="text-sm text-red-600">
                {errors.graduationYear.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Financial Information Section */}
      <section className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Financial Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyField
            name="annualTuitionFees"
            control={control}
            label="Annual Tuition Fees"
            required
            error={errors.annualTuitionFees?.message}
          />
          <CurrencyField
            name="hostelFees"
            control={control}
            label="Hostel Fees (if applicable)"
          />
          <CurrencyField
            name="otherCharges"
            control={control}
            label="Other Charges"
            className="md:col-span-2"
          />
        </div>

        {/* Scholarship Section */}
        <div className="space-y-4">
          <Controller
            name="scholarshipAvailed"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Scholarship / Fee Waiver Availed?</Label>
              </div>
            )}
          />

          {scholarshipAvailed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label>
                  Scholarship Name <span className="text-teal-600">*</span>
                </Label>
                <Controller
                  name="scholarshipName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Enter scholarship name" />
                  )}
                />
              </div>
              <CurrencyField
                name="scholarshipAmount"
                control={control}
                label="Amount Covered"
                required
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface SelectFieldProps {
  name: string;
  control: any;
  label: string;
  options: { value: string; label: string }[];
}

function SelectField({ name, control, label, options }: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

interface CurrencyFieldProps {
  name: string;
  control: any;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

function CurrencyField({
  name,
  control,
  label,
  required,
  error,
  className,
}: CurrencyFieldProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label className="flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-teal-500" />
        {label} {required && <span className="text-teal-600">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ...field } }) => (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              ₹
            </span>
            <Input
              {...field}
              type="number"
              value={value === 0 ? "" : value}
              onChange={(e) =>
                onChange(e.target.value === "" ? 0 : Number(e.target.value))
              }
              className="pl-8"
              min="0"
              step="1000"
            />
          </div>
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
