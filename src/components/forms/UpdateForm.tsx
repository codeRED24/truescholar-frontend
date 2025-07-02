"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import { LuMessageSquareOff, LuShieldCheck } from "react-icons/lu";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Button } from "@/components/ui/button";
import { getCurrentLocation, getCurrentUrl } from "../utils/utils";
import { toast } from "sonner";

const UpdateForm: React.FC = memo(() => {
  const [formData, setFormData] = useState({
    mobile_no: "",
    email: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUrl = getCurrentUrl();
  const fetchLocation = useCallback(async () => {
    try {
      const { latitude, longitude } = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        location: `${latitude}, ${longitude}`,
      }));
    } catch {
      setFormData((prev) => ({ ...prev, location: "Location not available" }));
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.mobile_no || !formData.email) {
        toast.error("Submission Error", {
          description: "There was a problem submitting your form.",
        });
        return;
      }

      setIsSubmitting(true);
      const newsletterData = {
        ...formData,
        response_url: currentUrl,
      };

      try {
        const response = await fetch("/api/post/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsletterData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error submitting feedback");
        }
        toast.success("Form Submitted Successfully", {
          description: "Your query has been received.",
        });
        setFormData({ mobile_no: "", email: "", location: formData.location });
      } catch (error) {
        toast.error("Submission Error", {
          description: "There was a problem submitting your form.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, currentUrl, toast]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
      <div className="relative flex w-full flex-col gap-1">
        <label htmlFor="mobile" className="text-sm text-[#344054]">
          Mobile No.
        </label>
        <span className="absolute right-2 top-2 z-10 flex items-center rounded-full bg-[#30D289] px-3 py-1 text-xs italic text-white">
          <LuShieldCheck strokeWidth={1.5} size={14} />
          Secure
        </span>
        <PhoneInput
          country="in"
          value={formData.mobile_no}
          onChange={(value) => handleInputChange("mobile_no", value)}
          inputStyle={{
            border: "1px solid #D0D5DD",
            borderRadius: "8px",
            width: "100%",
            height: "40px",
            padding: "8px 8px 8px 40px",
          }}
          containerStyle={{ width: "100%" }}
          disabled={isSubmitting}
        />
      </div>

      <div className="relative flex w-full flex-col gap-1">
        <label htmlFor="email" className="text-sm text-[#344054]">
          Email
        </label>
        <span className="absolute right-2 top-2 flex items-center rounded-full bg-[#48ACE2] px-3 py-1 text-xs italic text-white">
          <LuMessageSquareOff strokeWidth={1.5} size={14} />
          No spam
        </span>
        <input
          type="email"
          className="h-10 rounded-lg border border-[#D0D5DD] px-4 focus:outline-none disabled:opacity-50"
          id="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
});

UpdateForm.displayName = "UpdateForm";
export default UpdateForm;
