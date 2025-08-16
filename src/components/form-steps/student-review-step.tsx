"use client";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useFormContext } from "@/components/form-provider";
import { StarRating } from "@/components/star-rating";
import { ImageUpload } from "@/components/image-upload";
import { Camera } from "lucide-react";
import { Controller } from "react-hook-form";

export function StudentReviewStep() {
  const { studentReviewForm } = useFormContext();
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = studentReviewForm;

  return (
    <div className="">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Student Review
      </h2>
      <div className="space-y-20">
        {/* Review Title */}
        <div className="space-y-2">
          <Label
            htmlFor="reviewTitle"
            className="text-sm font-medium text-gray-700"
          >
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
