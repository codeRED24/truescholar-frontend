"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "@/components/form-provider";
import { Controller } from "react-hook-form";
import { StarRating } from "@/components/star-rating";
import { ImageUpload } from "@/components/image-upload";
import { Camera, FileText, Star } from "lucide-react";

export function FeedbackStep() {
  const { feedbackForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
  } = feedbackForm;

  return (
    <div className="">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Feedback & Review
      </h2>

      <div className="space-y-12">
        {/* Review Title */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <FileText className="w-4 h-4 text-teal-500" />
            Review Title <span className="text-teal-600">*</span>
          </Label>
          <Controller
            name="reviewTitle"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Input
                {...field}
                value={value || ""}
                onChange={onChange}
                placeholder="Give your review a catchy title (e.g., 'Best college for placements!')"
                className={`border-gray-300 ${
                  errors.reviewTitle ? "border-red-500" : ""
                }`}
              />
            )}
          />
          {errors.reviewTitle && (
            <p className="text-sm text-red-600">
              {errors.reviewTitle.message as string}
            </p>
          )}
        </div>

        {/* Overall Satisfaction */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tell us about your overall experience
            </Label>
            <Controller
              name="overallExperienceFeedback"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <Textarea
                  {...field}
                  value={value || ""}
                  onChange={onChange}
                  placeholder="Share your overall thoughts about the college..."
                  className="min-h-[100px] border-gray-300"
                />
              )}
            />
            {errors.overallExperienceFeedback && (
              <p className="text-sm text-red-600">
                {errors.overallExperienceFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("overallExperienceFeedback") || "").length}/2500
              characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Overall Satisfaction with College
            </span>
            <Controller
              name="overallSatisfactionRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.overallSatisfactionRating && (
              <p className="text-sm text-red-500">
                {errors.overallSatisfactionRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Teaching Quality */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              How would you rate the faculty and teaching methods?
            </Label>
            <Controller
              name="teachingQualityFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe the quality of teaching, faculty expertise, teaching methods, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.teachingQualityFeedback && (
              <p className="text-sm text-red-600">
                {errors.teachingQualityFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("teachingQualityFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Teaching Quality <span className="text-red-500">*</span>
            </span>
            <Controller
              name="teachingQualityRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.teachingQualityRating && (
              <p className="text-sm text-red-500">
                {errors.teachingQualityRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Infrastructure */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Rate the college infrastructure (labs, classrooms, facilities,
              etc.)
            </Label>
            <Controller
              name="infrastructureFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe the infrastructure, labs, classrooms, technology, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.infrastructureFeedback && (
              <p className="text-sm text-red-600">
                {errors.infrastructureFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("infrastructureFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Infrastructure <span className="text-red-500">*</span>
            </span>
            <Controller
              name="infrastructureRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.infrastructureRating && (
              <p className="text-sm text-red-500">
                {errors.infrastructureRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Library and Study Resources */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              How would you rate the library and study resources?
            </Label>
            <Controller
              name="libraryFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe the library facilities, study resources, online resources, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.libraryFeedback && (
              <p className="text-sm text-red-600">
                {errors.libraryFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("libraryFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Library and Study Resources{" "}
              <span className="text-red-500">*</span>
            </span>
            <Controller
              name="libraryRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.libraryRating && (
              <p className="text-sm text-red-500">
                {errors.libraryRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Placement Support */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Rate the placement and career support services
            </Label>
            <Controller
              name="placementSupportFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe placement cell support, companies visiting, training programs, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.placementSupportFeedback && (
              <p className="text-sm text-red-600">
                {errors.placementSupportFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("placementSupportFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Placement Support <span className="text-red-500">*</span>
            </span>
            <Controller
              name="placementSupportRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.placementSupportRating && (
              <p className="text-sm text-red-500">
                {errors.placementSupportRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Administrative Support */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              How efficient is the administration and support staff?
            </Label>
            <Controller
              name="administrativeSupportFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe administrative processes, staff helpfulness, response time, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.administrativeSupportFeedback && (
              <p className="text-sm text-red-600">
                {errors.administrativeSupportFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("administrativeSupportFeedback") || "").length}/2500
              characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Administrative Support <span className="text-red-500">*</span>
            </span>
            <Controller
              name="administrativeSupportRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.administrativeSupportRating && (
              <p className="text-sm text-red-500">
                {errors.administrativeSupportRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Hostel / Accommodation */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Rate the hostel/accommodation facilities (if applicable)
            </Label>
            <Controller
              name="hostelFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe hostel facilities, food quality, maintenance, security, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.hostelFeedback && (
              <p className="text-sm text-red-600">
                {errors.hostelFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("hostelFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Hostel / Accommodation <span className="text-red-500">*</span>
            </span>
            <Controller
              name="hostelRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.hostelRating && (
              <p className="text-sm text-red-500">
                {errors.hostelRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Extra-curricular Activities */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              How would you rate sports, cultural activities, and student life?
            </Label>
            <Controller
              name="extracurricularFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe sports facilities, cultural events, clubs, student activities, etc..."
                  className="min-h-[80px] border-gray-300"
                />
              )}
            />
            {errors.extracurricularFeedback && (
              <p className="text-sm text-red-600">
                {errors.extracurricularFeedback.message as string}
              </p>
            )}
            <div className="text-right text-sm text-gray-500">
              {(watch("extracurricularFeedback") || "").length}/2500 characters
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-teal-600">
              Extra-curricular Activities{" "}
              <span className="text-red-500">*</span>
            </span>
            <Controller
              name="extracurricularRating"
              control={control}
              render={({ field }) => (
                <StarRating
                  rating={field.value || 0}
                  onRatingChange={(rating) => field.onChange(rating)}
                />
              )}
            />
            {errors.extracurricularRating && (
              <p className="text-sm text-red-500">
                {errors.extracurricularRating.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Suggestions for Improvement */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-lg font-semibold text-blue-800">
            <Star className="w-5 h-5" />
            Suggestions for Improvement <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="improvementSuggestions"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <Textarea
                {...field}
                value={value || ""}
                onChange={onChange}
                placeholder="What suggestions do you have to improve the college? Any areas that need attention... (minimum 10 characters)"
                className="min-h-[120px] border-gray-300"
              />
            )}
          />
          {errors.improvementSuggestions && (
            <p className="text-sm text-red-600">
              {errors.improvementSuggestions.message as string}
            </p>
          )}
          <div className="text-right text-sm text-gray-500">
            {(watch("improvementSuggestions") || "").length}/2500 characters
          </div>
        </div>

        {/* College Images */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Camera className="w-4 h-4" />
            Share College Images <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">
            Please upload at least 1 image and maximum 6 images of your college
          </p>
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
