"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReviewForm } from "../form-provider";
import { Controller } from "react-hook-form";
import { StarRating } from "@/components/star-rating";
import { ImageUpload } from "@/components/image-upload";
import { FileUpload } from "@/components/file-upload";
import { Camera, FileText, Star, Linkedin } from "lucide-react";

// Rating categories configuration
const RATING_SECTIONS = [
  {
    ratingKey: "overallSatisfactionRating",
    feedbackKey: "overallExperienceFeedback",
    title: "Overall Satisfaction with College",
    placeholder: "Share your overall thoughts about the college...",
  },
  {
    ratingKey: "teachingQualityRating",
    feedbackKey: "teachingQualityFeedback",
    title: "Teaching Quality",
    placeholder: "Describe the quality of teaching, faculty expertise...",
  },
  {
    ratingKey: "infrastructureRating",
    feedbackKey: "infrastructureFeedback",
    title: "Infrastructure",
    placeholder: "Describe the infrastructure, labs, classrooms...",
  },
  {
    ratingKey: "libraryRating",
    feedbackKey: "libraryFeedback",
    title: "Library and Study Resources",
    placeholder: "Describe the library facilities, study resources...",
  },
  {
    ratingKey: "placementSupportRating",
    feedbackKey: "placementSupportFeedback",
    title: "Placement Support",
    placeholder: "Describe placement cell support, companies visiting...",
  },
  {
    ratingKey: "administrativeSupportRating",
    feedbackKey: "administrativeSupportFeedback",
    title: "Administrative Support",
    placeholder: "Describe administrative processes, staff helpfulness...",
  },
  {
    ratingKey: "hostelRating",
    feedbackKey: "hostelFeedback",
    title: "Hostel / Accommodation",
    placeholder: "Describe hostel facilities, food quality, security...",
  },
  {
    ratingKey: "extracurricularRating",
    feedbackKey: "extracurricularFeedback",
    title: "Extra-curricular Activities",
    placeholder: "Describe sports facilities, cultural events, clubs...",
  },
] as const;

export function FeedbackStep() {
  const { feedbackForm } = useReviewForm();
  const {
    control,
    formState: { errors },
    watch,
  } = feedbackForm;

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-semibold text-gray-900">
        Feedback & Review
      </h2>

      {/* Review Title */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-500" />
          Review Title <span className="text-teal-600">*</span>
        </Label>
        <Controller
          name="reviewTitle"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Give your review a catchy title (e.g., 'Best college for placements!')"
            />
          )}
        />
        {errors.reviewTitle && (
          <p className="text-sm text-red-600">{errors.reviewTitle.message}</p>
        )}
      </div>

      {/* Rating Sections */}
      {RATING_SECTIONS.map((section) => (
        <RatingSection
          key={section.ratingKey}
          control={control}
          ratingKey={section.ratingKey}
          feedbackKey={section.feedbackKey}
          title={section.title}
          placeholder={section.placeholder}
          watch={watch}
          errors={errors}
        />
      ))}

      {/* Suggestions for Improvement */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-lg font-semibold text-teal-800">
          <Star className="w-5 h-5" />
          Suggestions for Improvement <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="improvementSuggestions"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="What suggestions do you have to improve the college? (minimum 100 characters)"
              className="min-h-[120px]"
            />
          )}
        />
        {errors.improvementSuggestions && (
          <p className="text-sm text-red-600">
            {errors.improvementSuggestions.message}
          </p>
        )}
        <CharCount value={watch("improvementSuggestions")} />
      </div>

      {/* College Images */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-teal-500" />
          College Images <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">
          Upload 1-6 images of your college
        </p>
        <Controller
          name="collegeImages"
          control={control}
          render={({ field }) => (
            <ImageUpload
              images={field.value || []}
              onImagesChange={field.onChange}
              maxImages={6}
            />
          )}
        />
        {errors.collegeImages && (
          <p className="text-sm text-red-600">{errors.collegeImages.message}</p>
        )}
      </div>

      {/* Profile Verification */}
      <section className="space-y-6 pt-8 border-t">
        <h3 className="text-xl font-semibold text-gray-900">
          Profile Verification
        </h3>

        {/* LinkedIn */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-blue-600" />
            LinkedIn Profile (optional)
          </Label>
          <Controller
            name="linkedinProfile"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="https://linkedin.com/in/..." />
            )}
          />
        </div>

        {/* File Uploads */}
        <div className="space-y-4">
          <Controller
            name="studentId"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Upload Student ID"
                file={field.value || null}
                onFileChange={field.onChange}
                accept="image/*,.pdf"
              />
            )}
          />
          <Controller
            name="markSheet"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Upload Mark Sheet"
                file={field.value || null}
                onFileChange={field.onChange}
                accept="image/*,.pdf"
              />
            )}
          />
          <Controller
            name="degreeCertificate"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Upload Degree Certificate"
                file={field.value || null}
                onFileChange={field.onChange}
                accept="image/*,.pdf"
              />
            )}
          />
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface RatingSectionProps {
  control: any;
  ratingKey: string;
  feedbackKey: string;
  title: string;
  placeholder: string;
  watch: any;
  errors: any;
}

function RatingSection({
  control,
  ratingKey,
  feedbackKey,
  title,
  placeholder,
  watch,
  errors,
}: RatingSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-lg font-semibold text-teal-600">
          {title} <span className="text-red-500">*</span>
        </span>
        <Controller
          name={ratingKey}
          control={control}
          render={({ field }) => (
            <StarRating
              rating={field.value || 0}
              onRatingChange={field.onChange}
            />
          )}
        />
        {errors[ratingKey] && (
          <p className="text-sm text-red-500">{errors[ratingKey].message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Controller
          name={feedbackKey}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder={placeholder}
              className="min-h-[80px]"
            />
          )}
        />
        {errors[feedbackKey] && (
          <p className="text-sm text-red-600">{errors[feedbackKey].message}</p>
        )}
        <CharCount value={watch(feedbackKey)} />
      </div>
    </div>
  );
}

function CharCount({ value, max = 5000 }: { value?: string; max?: number }) {
  const length = (value || "").length;
  return (
    <div className="text-right text-sm text-gray-500">
      {length}/{max} characters
    </div>
  );
}
