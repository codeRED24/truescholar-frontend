"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "@/components/form-provider";
import {
  User,
  Mail,
  Users,
  Phone,
  Globe,
  GraduationCap,
  MapPin,
  BookOpen,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { SuggestionInput } from "@/components/ui/suggestion-input";
import { useUniSearch } from "@/app/hooks/useUniSearch";
import { useOnlyCollegeIdCompare } from "@/app/hooks/useOnlyCollegeIdCompare";
import { useState, useEffect, useCallback } from "react";

export function PersonalDetailsStep() {
  const { formData, updateFormData, personalDetailsForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = personalDetailsForm;

  const isPhoneVerified = watch("isPhoneVerified") || false;
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
        (college) => (college.college_name || college.name) === collegeName
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

      updateFormData({
        collegeName: collegeDisplayName,
        collegeId: collegeId,
        collegeLocation: collegeLocation,
        courseName: "",
        courseId: 0,
      });
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseValue: string) => {
    const course = courses.find(
      (c) =>
        c.college_wise_course_id != null &&
        c.college_wise_course_id.toString() === courseValue
    );
    if (course) {
      setValue("courseName", course.name);
      setValue("courseId", Number(course.college_wise_course_id));

      updateFormData({
        courseName: course.name,
        courseId: Number(course.college_wise_course_id),
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User className="w-4 h-4 text-teal-500" />
            Name <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="name"
                placeholder="Enter your full name"
                className={`border-gray-300 ${
                  errors.name ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ name: e.target.value });
                }}
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-red-600">
              {errors.name.message as string}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4 text-teal-500" />
            Email ID <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`border-gray-300 ${
                  errors.email ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ email: e.target.value });
                }}
              />
            )}
          />
          {errors.email && (
            <p className="text-sm text-red-600">
              {errors.email.message as string}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-teal-500" />
            Gender <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ gender: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.gender ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-red-600">
              {errors.gender.message as string}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Phone className="w-4 h-4 text-teal-500" />
            Contact Number <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <div className="w-full p-[1px] focus-within:ring-1 focus-within:ring-green-800 rounded-md z-10">
                <PhoneInput
                  country="in"
                  value={field.value}
                  onChange={(phone) => {
                    field.onChange(phone);
                    updateFormData({ contactNumber: phone });
                    // Reset verification when phone changes
                    if (isPhoneVerified) {
                      setValue("isPhoneVerified", false);
                      updateFormData({ isPhoneVerified: false });
                    }
                  }}
                  inputStyle={{
                    border: "1px solid #D0D5DD",
                    borderRadius: "4px !important",
                    width: "100%",
                    height: "36px",
                    padding: "8px 8px 8px 40px",
                  }}
                  buttonStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #d0d5dd",
                    borderRight: "none",
                    borderRadius: "2px !important",
                  }}
                  placeholder="Enter contact number"
                  enableSearch
                  containerStyle={{ width: "100%" }}
                  disableSearchIcon
                  searchPlaceholder="Search countries..."
                  specialLabel=""
                />
              </div>
            )}
          />
          {errors.contactNumber && (
            <p className="text-sm text-red-600">
              {errors.contactNumber.message as string}
            </p>
          )}
        </div>

        {/* Country of Origin */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4 text-teal-500" />
            Country Of Origin <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="countryOfOrigin"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  updateFormData({ countryOfOrigin: value });
                }}
              >
                <SelectTrigger
                  className={`border-gray-300 ${
                    errors.countryOfOrigin ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.countryOfOrigin && (
            <p className="text-sm text-red-600">
              {errors.countryOfOrigin.message as string}
            </p>
          )}
        </div>

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
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ collegeLocation: e.target.value });
                }}
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
                          (c) =>
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
                        (course) =>
                          course.college_wise_course_id != null && course.name
                      )
                      .map((course) => (
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
                  updateFormData({ graduationYear: value });
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

        {/* UPI ID */}
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor="upiId"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CreditCard className="w-4 h-4 text-teal-500" />
            Enter UPI ID For Cash Rewards{" "}
          </Label>
          <Controller
            name="upiId"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="upiId"
                placeholder="Enter your UPI ID (e.g., username@paytm)"
                className={`border-gray-300 ${
                  errors.upiId ? "border-red-500" : ""
                }`}
                onChange={(e) => {
                  field.onChange(e);
                  updateFormData({ upiId: e.target.value });
                }}
              />
            )}
          />
          {errors.upiId && (
            <p className="text-sm text-red-600">
              {errors.upiId.message as string}
            </p>
          )}
          <p className="text-sm text-teal-700">
            Sharing Your UPI ID with TrueScholar is 100% safe, secure &
            confidential. Your UPI will be used solely to share rewards.{""}
            <a
              href="/privacy-policy"
              className="underline text-teal-600 hover:text-teal-800"
            >
              Concerned About Privacy?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
