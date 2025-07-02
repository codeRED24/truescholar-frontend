"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { LuMessageSquareOff, LuShieldCheck } from "react-icons/lu";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getCurrentLocation, getCurrentUrl } from "../utils/utils";
import { toast } from "sonner";

interface FormData {
  name: string;
  mobile_no: string;
  email: string;
  feedback_query: string;
}

interface NPSModalProps {
  open: boolean;
  onClose: () => void;
  rating: number;
  response_url?: string;
  location?: object;
}

const NPSModal: React.FC<NPSModalProps> = memo(({ open, onClose, rating }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    mobile_no: "",
    email: "",
    feedback_query: "",
  });
  const [location, setLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const currentUrl = getCurrentUrl();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { latitude, longitude } = await getCurrentLocation();
        setLocation(`${latitude}, ${longitude}`);
      } catch {
        setLocation("Location not available");
      }
    };
    if (open) fetchLocation();
  }, [open]);

  const handleInputChange = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      const feedbackData = {
        rating,
        ...formData,
        response_url: currentUrl,
        location,
      };

      try {
        const response = await fetch("/api/post/nps-rating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to submit feedback");
        }

        toast.success("Form Submitted Successfully", {
          description: "Your query has been received.",
        });
        onClose();
      } catch (error) {
        toast.error("Submission Error", {
          description: "There was a problem submitting your form.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, rating, currentUrl, location, toast, onClose]
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white py-8 px-6 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold pb-6">
            Your Opinion Counts
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm text-[#344054]">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name")(e.target.value)}
              className="h-10 border border-[#D0D5DD] rounded-2xl px-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1 relative">
            <label htmlFor="mobile" className="text-sm text-[#344054]">
              Mobile No.
            </label>
            <span className="absolute top-8 right-2 bg-[#30D289] text-white text-xs italic px-2 py-1 rounded-full flex items-center gap-1 z-10">
              <LuShieldCheck size={14} />
              Secure
            </span>
            <PhoneInput
              country="in"
              value={formData.mobile_no}
              onChange={handleInputChange("mobile_no")}
              inputProps={{
                id: "mobile",
                required: true,
                disabled: isSubmitting,
              }}
              inputStyle={{
                border: "1px solid #D0D5DD",
                borderRadius: "8px",
                width: "100%",
                height: "40px",
                padding: "8px 8px 8px 40px",
              }}
            />
          </div>

          <div className="flex flex-col gap-1 relative">
            <label htmlFor="email" className="text-sm text-[#344054]">
              Email
            </label>
            <span className="absolute top-8 right-2 bg-[#48ACE2] text-white text-xs italic px-2 py-1 rounded-full flex items-center gap-1">
              <LuMessageSquareOff size={14} />
              No Spam
            </span>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email")(e.target.value)}
              className="h-10 border border-[#D0D5DD] rounded-2xl px-3 focus:outline-none focus:ring-2 focus:ring-primary-3"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="feedback" className="text-sm text-[#344054]">
              Feedback
            </label>
            <textarea
              id="feedback"
              placeholder="Your Feedback"
              value={formData.feedback_query}
              onChange={(e) =>
                handleInputChange("feedback_query")(e.target.value)
              }
              className="border border-[#D0D5DD] rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-3 resize-y"
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-3 hover:bg-primary-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default NPSModal;
