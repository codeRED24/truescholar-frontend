"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LuMail, LuPhone, LuMapPin } from "react-icons/lu";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useIsMobile } from "../utils/useMobile";
import { toast } from "sonner";
import DropdownFilter from "../miscellaneous/DropdownFilter";
import { CourseDTO } from "@/api/@types/course-type";

interface FormData {
  name: string;
  email: string;
  mobile_no: string;
  course_group_id: number | null;
  query: string;
  location: string;
  response_url: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface ContactFormProps {
  courseData: CourseDTO[];
}

const ContactForm: React.FC<ContactFormProps> = ({ courseData }) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile_no: "",
    course_group_id: null,
    query: "",
    location: "",
    response_url: typeof window !== "undefined" ? window.location.href : "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const inputStyle = {
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    width: isMobile ? "100%" : "285px",
    height: "42px",
    padding: "10px 12px 10px 40px",
    backgroundColor: "#F9FAFB",
    transition: "border-color 0.2s ease",
  };

  const courseOptions: FilterOption[] = courseData.map((course) => ({
    value: String(course.course_group_id),
    label: course.full_name || course.course_name,
  }));

  useEffect(() => {
    if (!navigator?.geolocation) {
      setFormData((prev) => ({ ...prev, location: "" }));
      return;
    }

    const successHandler = ({
      coords: { latitude, longitude },
    }: GeolocationPosition) => {
      setFormData((prev) => ({
        ...prev,
        location: `${latitude},${longitude}`,
      }));
    };

    const errorHandler = () => {
      setFormData((prev) => ({ ...prev, location: "" }));
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile_no ||
      formData.course_group_id === null ||
      !formData.query
    ) {
      toast.error("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/post/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Form Submitted Successfully", {
          description: "We'll get back to you soon!",
        });
        setFormData({
          name: "",
          email: "",
          mobile_no: "",
          course_group_id: null,
          query: "",
          location: "",
          response_url:
            typeof window !== "undefined" ? window.location.href : "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      toast.error("Submission Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full py-16 md:py-12 lg:py-10 bg-gray-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(229,231,235,0.2)_0%,_transparent_50%)] pointer-events-none" />

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          <span className="bg-gradient-to-r from-[#141A21] to-primary-main bg-clip-text text-transparent">
            Get in Touch
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions? We're here to help. Fill out the form or reach us
          directly!
        </p>
      </div>

      <div className="max-w-6xl mx-auto lg:grid grid-cols-12 gap-8 px-4 md:px-8 lg:px-0">
        <div className="col-span-7 bg-gradient-to-tr from-primary-1 to-indigo-50 rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-2xl px-4 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-main transition"
                  id="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="border border-gray-300 rounded-2xl px-4 py-2 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-main transition w-full"
                    id="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <LuMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Course
                </label>
                <DropdownFilter
                  options={courseOptions}
                  selected={
                    formData.course_group_id === null
                      ? null
                      : String(formData.course_group_id)
                  }
                  placeholder="Select a course"
                  searchable={true}
                  onSelect={(value) =>
                    setFormData({
                      ...formData,
                      course_group_id: value ? Number(value) : null,
                    })
                  }
                  className="bg-gray-50 text-gray-800 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-main"
                />
              </div>
              <div className="flex flex-col gap-2 relative">
                <label
                  htmlFor="mobile"
                  className="text-sm font-medium text-gray-700"
                >
                  Mobile No.
                </label>
                <PhoneInput
                  country="in"
                  value={formData.mobile_no}
                  onChange={(mobile) =>
                    setFormData({ ...formData, mobile_no: mobile })
                  }
                  inputStyle={inputStyle}
                  containerClass="focus-within:ring-2 focus-within:ring-primary-main rounded-2xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="query"
                className="text-sm font-medium text-gray-700"
              >
                Your Query
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-main transition resize-none"
                id="query"
                rows={4}
                placeholder="Tell us how we can assist you..."
                value={formData.query}
                onChange={(e) =>
                  setFormData({ ...formData, query: e.target.value })
                }
              />
            </div>

            <div className="text-right">
              <Button
                type="submit"
                disabled={isSubmitting}
                className=" bg-[#141A21] hover:bg-primary-main text-white hover:text-white font-semibold py-2 px-6 rounded-2xl transition duration-200"
              >
                {isSubmitting ? "Submitting..." : "Send Message"}
              </Button>
            </div>
          </form>
        </div>

        <div className="col-span-5 bg-gradient-to-br from-indigo-50 to-primary-1 rounded-2xl shadow-lg p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <LuMail className="text-primary-main" size={20} />
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Email</h5>
                  <Link
                    href="mailto:contact@truescholar.in"
                    className="text-primary-main hover:underline"
                  >
                    contact@truescholar.in
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LuPhone className="text-primary-main" size={20} />
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Phone</h5>
                  <Link href="tel:+919876543201" className="text-gray-600">
                    +91 9876543201
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LuMapPin className="text-primary-main" size={20} />
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Location
                  </h5>
                  <p className="text-gray-600">Gurugram, Haryana, India</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Follow Us
            </h5>
            <div className="flex gap-4">
              <Link
                href="#"
                className="text-primary-main hover:text-[#141A21] transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="text-primary-main hover:text-[#141A21] transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452H16.85v-5.569c0-1.327-.024-3.037-1.852-3.037-1.852 0-2.136 1.446-2.136 2.94v5.666H9.264V9.143h3.438v1.536h.048c.48-.91 1.653-1.872 3.404-1.872 3.638 0 4.31 2.394 4.31 5.507v6.138zM5.337 7.607c-1.105 0-2-.896-2-2s.895-2 2-2c1.104 0 2 .896 2 2s-.896 2-2 2zm1.828 12.845H3.51V9.143h3.655v11.309zM22.225 0H1.771C.792 0 0 .773 0 1.728v20.543C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.728C24 .773 23.2 0 22.225 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Map Section (Uncomment if needed) */}
      {/* <div className="max-w-6xl mx-auto mt-10 shadow-lg rounded-2xl overflow-hidden">
        <iframe
          title="Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.1842190765374!2d77.0717813!3d28.413697700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d226e3d8fffff%3A0x803f52ac0303d011!2sUnitech%20Business%20Zone%20Tower%20A!5e0!3m2!1sen!2sin!4v1740046605474!5m2!1sen!2sin"
          className="w-full h-80"
          loading="lazy"
        ></iframe>
      </div> */}
    </div>
  );
};

export default ContactForm;
