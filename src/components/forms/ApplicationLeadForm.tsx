"use client";

import React, { useCallback, useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { HomeCity } from "@/api/@types/home-datatype";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "../utils/useMobile";
import { getCurrentLocation } from "../utils/utils";
import { getColleges } from "@/api/list/getColleges";
import { getCourses } from "@/api/list/getCourses";
import { getCities } from "@/api/list/getCities";
import DropdownFilter from "../miscellaneous/DropdownFilter";
import { CollegeDTO } from "@/api/@types/college-list";
import { toast } from "sonner";
import { CourseDTO } from "@/api/@types/course-type";

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

function TextInput({
  label,
  type,
  value,
  error,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-80">
      <input
        type={type}
        placeholder={label}
        aria-label={label}
        className={`h-11 w-full border rounded-2xl px-4 text-sm text-[#1A237E] bg-white focus:outline-none focus:ring-1 focus:ring-[#D81B60] transition-all duration-200 ${
          error ? "border-[#AD1457]" : "border-[#D81B60]/30"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="text-[#AD1457] text-xs mt-1">{error}</span>}
    </div>
  );
}

export function ApplicationLeadForm() {
  const isMobile = useIsMobile();

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

  const [clgData, setClgData] = useState<CollegeDTO[]>([]);
  const [courseData, setCourseData] = useState<CourseDTO[]>([]);
  const [cityData, setCityData] = useState<HomeCity[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputStyle = {
    border: "1px solid #d81b6069",
    width: isMobile ? "100%" : "320px",
    height: "44px",
    padding: "8px 8px 8px 40px",
    backgroundColor: "#FFFFFF",
    color: "#1A237E",
    transition: "border-color 0.2s ease",
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [colleges, courses, cities] = await Promise.all([
        getColleges({ limit: 500, page: 1 }),
        getCourses(),
        getCities(),
      ]);
      setClgData((colleges?.colleges as CollegeDTO[]) || []);
      setCourseData(courses || []);
      setCityData(cities || []);
    } catch (error) {
      toast.error("Submission Error", {
        description: "There was a problem loading the form data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const validateForm = () => {
    const requiredFields: Array<keyof LeadFormData> = [
      "name",
      "email",
      "mobile_no",
    ];
    const formErrors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) formErrors[field] = "This field is required.";
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "Enter a valid email address.";
    }

    if (formData.mobile_no && formData.mobile_no.length < 10) {
      formErrors.mobile_no = "Enter a valid phone number.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/post/lead-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Form Submitted Successfully", {
          description: "We'll get back to you soon!",
        });
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: "",
          mobile_no: "",
          course_group_id: null,
          college_id: null,
          city_id: null,
        }));
      } else throw new Error("Submission failed.");
    } catch {
      toast.error("Submission Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseOptions = courseData.map((course) => ({
    value: String(course.course_group_id),
    label: course.course_name,
  }));

  const collegeOptions = clgData.map((college) => ({
    value: String(college.college_id),
    label: college.college_name,
  }));

  const cityOptions = cityData.map((city) => ({
    value: String(city.city_id),
    label: city.city_name,
  }));

  if (isLoading) {
    return (
      <div className="bg-gray-300 w-full animate-pulse" />
    );
  }

  return (
    <div className="bg-white md:rounded-3xl p-6 md:p-8 transform hover:scale-105 transition-transform duration-300">
      <h4 className="text-[#D81B60] text-2xl md:text-3xl font-extrabold mb-6 bg-gradient-to-r from-[#D81B60] to-[#FFCA28] bg-clip-text text-transparent">
        Apply for MBA 2025 Now!
      </h4>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-5"
        autoComplete="off"
      >
        <TextInput
          label="Your Name"
          type="text"
          value={formData.name}
          error={errors.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
        />
        <TextInput
          label="Your Email"
          type="email"
          value={formData.email}
          error={errors.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
        />
        <div className="w-80">
          <PhoneInput
            country="in"
            value={formData.mobile_no}
            placeholder="Your Mobile Number"
            onChange={(value) => setFormData({ ...formData, mobile_no: value })}
            inputStyle={inputStyle}
            containerClass="focus-within:ring-1 focus-within:ring-[#D81B60] rounded-2xl"
          />
          {errors.mobile_no && (
            <span className="text-[#AD1457] text-xs mt-1">
              {errors.mobile_no}
            </span>
          )}
        </div>

        <DropdownFilter
          options={collegeOptions}
          selected={
            formData.college_id === null ? null : String(formData.college_id)
          }
          placeholder="Select a College"
          searchable={true}
          onSelect={(value) =>
            setFormData({
              ...formData,
              college_id: value ? Number(value) : null,
            })
          }
          className="bg-white text-[#1A237E] rounded-2xl border border-[#D81B60]/30 focus:ring-1 focus:ring-[#D81B60] min-w-80 h-11"
        />
        <DropdownFilter
          options={cityOptions}
          selected={formData.city_id === null ? null : String(formData.city_id)}
          placeholder="Select a City"
          searchable={true}
          onSelect={(value) =>
            setFormData({
              ...formData,
              city_id: value ? Number(value) : null,
            })
          }
          className="bg-white text-[#1A237E] rounded-2xl border border-[#D81B60]/30 focus:ring-1 focus:ring-[#D81B60]  min-w-80 h-11"
        />
        <Button
          className="bg-[#D81B60] hover:bg-[#AD1457] text-white hover:text-white w-80 font-semibold py-2 rounded-lg shadow-md hover:scale-105 transition-all duration-200"
          type="submit"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Submitting..." : "Start Your Journey"}
        </Button>
      </form>
    </div>
  );
}
