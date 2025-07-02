"use client";

import React, { useState, useEffect, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Button } from "../ui/button";
import { LuMessageSquareOff, LuShieldCheck } from "react-icons/lu";
import { CourseDTO } from "@/api/@types/course-type";
import { HomeCity } from "@/api/@types/home-datatype";
import { toast } from "sonner";
import { getCurrentLocation } from "../utils/utils";
import DropdownFilter from "../miscellaneous/DropdownFilter";
import { CollegeDTO } from "@/api/@types/college-list";

type LeadFormData = {
  name: string;
  email: string;
  mobile_no: string;
  course_group_id: number | null;
  college_id: number | null;
  city_id: number | null;
  response_url: string;
  location: string;
  preferred_city: number | null;
  not_sure: boolean;
};

interface LeadFormProps {
  collegeData: CollegeDTO[];
  courseData: CourseDTO[];
  cityData: HomeCity[];
  brochureUrl?: string;
  onFormSubmitSuccess?: (formData: LeadFormData) => void;
}

const LeadForm: React.FC<LeadFormProps> = ({
  collegeData,
  courseData,
  cityData,
  brochureUrl,
  onFormSubmitSuccess,
}) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    mobile_no: "",
    course_group_id: null,
    college_id: null,
    city_id: null,
    not_sure: false,
    response_url: typeof window !== "undefined" ? window.location.href : "",
    location: "",
    preferred_city: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const courseOptions = courseData.map((course) => ({
    value: String(course.course_group_id),
    label: course.full_name || "",
  }));
  const collegeOptions = collegeData.map((college) => ({
    value: String(college.college_id),
    label: college.college_name,
  }));
  const cityOptions = cityData.map((city) => ({
    value: String(city.city_id),
    label: city.city_name,
  }));

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        setFormData((prev) => ({
          ...prev,
          location: `${latitude}, ${longitude}`,
        }));
      } catch {
        setFormData((prev) => ({
          ...prev,
          location: "Location not available",
        }));
      }
    };
    fetchLocation();
  }, []);

  const handleChange = useCallback((key: keyof LeadFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};
    const requiredFields: (keyof LeadFormData)[] = [
      "name",
      "email",
      "mobile_no",
      "course_group_id",
      "college_id",
      "city_id",
    ];

    requiredFields.forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleBrochureDownload = useCallback(() => {
    if (brochureUrl) {
      const newWindow = window.open(brochureUrl, "_blank");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        window.location.href = brochureUrl;
      }
    }
  }, [brochureUrl]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/post/lead-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to submit form");

        toast.success("Form Submitted Successfully", {
          description: "Your query has been received.",
        });

        const resetData = {
          name: "",
          email: "",
          mobile_no: "",
          course_group_id: null,
          college_id: null,
          city_id: null,
          not_sure: false,
          response_url: typeof window !== "undefined" ? window.location.href : "",
          location: formData.location,
          preferred_city: null,
        };
        setFormData(resetData);
        onFormSubmitSuccess?.(formData); // Pass formData to parent
        handleBrochureDownload();
      } catch {
        toast.error("Submission Error", {
          description: "There was a problem submitting your form.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onFormSubmitSuccess, handleBrochureDownload]
  );

  return (
    <div className="max-w-3xl mx-auto md:p-4 bg-white rounded-b-2xl">
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="flex flex-col gap-2 md:gap-6 overflow-y-auto max-h-[80vh] pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-[#344054]">Course</label>
              <DropdownFilter
                options={courseOptions}
                selected={formData.course_group_id ? String(formData.course_group_id) : null}
                placeholder="Select a course"
                searchable={true}
                onSelect={(value) => handleChange("course_group_id", value ? Number(value) : null)}
                className="bg-gray-50 text-gray-800 max-w-80 rounded-2xl"
              />
              {errors.course_group_id && (
                <span className="text-red-500 text-sm">{errors.course_group_id}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-[#344054]">College</label>
              <DropdownFilter
                options={collegeOptions}
                selected={formData.college_id ? String(formData.college_id) : null}
                placeholder="Select a college"
                searchable={true}
                onSelect={(value) => handleChange("college_id", value ? Number(value) : null)}
                className="bg-gray-50 text-gray-800 max-w-80 rounded-2xl"
              />
              {errors.college_id && (
                <span className="text-red-500 text-sm">{errors.college_id}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-[#344054]">City</label>
              <DropdownFilter
                options={cityOptions}
                selected={formData.city_id ? String(formData.city_id) : null}
                placeholder="Select your city"
                searchable={true}
                onSelect={(value) => handleChange("city_id", value ? Number(value) : null)}
                className="bg-gray-50 text-gray-800 max-w-80 rounded-2xl"
              />
              {errors.city_id && (
                <span className="text-red-500 text-sm">{errors.city_id}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-[#344054]">Preferred City</label>
              <DropdownFilter
                options={cityOptions}
                selected={formData.preferred_city ? String(formData.preferred_city) : null}
                placeholder="Select your preferred city"
                searchable={true}
                onSelect={(value) => handleChange("preferred_city", value ? Number(value) : null)}
                className="bg-gray-50 text-gray-800 max-w-80 rounded-2xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.not_sure}
              onChange={(e) => handleChange("not_sure", e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded"
              aria-label="Not sure"
            />
            <label className="text-sm text-gray-700">
              I’m still figuring out my course, college, and city!
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm text-[#344054]">Name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-8 md:h-10 border border-[#D0D5DD] rounded-2xl px-3 text-gray-800 bg-gray-50"
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="text-red-500 text-sm">{errors.name}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-1 relative">
              <label className="text-sm text-[#344054]">Mobile No.</label>
              <span className="absolute top-3 right-2 bg-[#30D289] text-white text-xs italic px-2 py-1 rounded-full flex items-center gap-1 z-10">
                <LuShieldCheck size={14} />
                Secure
              </span>
              <PhoneInput
                country="in"
                value={formData.mobile_no}
                onChange={(value) => handleChange("mobile_no", value)}
                inputProps={{ required: true, disabled: isSubmitting }}
                inputStyle={{
                  border: "1px solid #D0D5DD",
                  borderRadius: "8px",
                  width: "100%",
                  height: "40px",
                  padding: "8px 8px 8px 40px",
                  backgroundColor: "#F9FAFB",
                }}
              />
              {errors.mobile_no && (
                <span className="text-red-500 text-sm">{errors.mobile_no}</span>
              )}
            </div>

            <div className="w-full flex flex-col gap-1 relative">
              <label className="text-sm text-[#344054]">Email</label>
              <span className="absolute top-3 right-2 bg-[#48ACE2] text-white text-xs italic px-2 py-1 rounded-full flex items-center gap-1">
                <LuMessageSquareOff size={14} />
                No Spam
              </span>
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-8 md:h-10 border border-[#D0D5DD] rounded-2xl px-3 text-gray-800 bg-gray-50 focus:outline-none"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto bg-primary-3 hover:bg-primary-4"
          >
            {isSubmitting ? "Submitting..." : "Get a Callback"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;