import { useState } from "react";

interface UseSubmitReviewState {
  isLoading: boolean;
  error: string | null;
  data: any | null;
}

interface UseSubmitReviewReturn extends UseSubmitReviewState {
  submitReviewAsync: (payload: {
    // User ID to link the review to the user
    userId?: number | null;

    // College information (from step 2)
    collegeId?: number;
    courseId?: number;
    collegeLocation?: string;
    passYear?: number;

    // Academic Information (from step 2)
    isAnonymous?: boolean;
    stream?: string;
    yearOfStudy?: string;
    modeOfStudy?: string;
    currentSemester?: string;

    // Financial Information (from step 3)
    annualTuitionFees?: number;
    hostelFees?: number;
    otherCharges?: number;
    scholarshipAvailed?: boolean;
    scholarshipName?: string;
    scholarshipAmount?: number;

    // Feedback fields (from step 4)
    reviewTitle?: string;
    overallSatisfactionRating?: number;
    overallExperienceFeedback?: string;
    teachingQualityRating?: number;
    teachingQualityFeedback?: string;
    infrastructureRating?: number;
    infrastructureFeedback?: string;
    libraryRating?: number;
    libraryFeedback?: string;
    placementSupportRating?: number;
    placementSupportFeedback?: string;
    administrativeSupportRating?: number;
    administrativeSupportFeedback?: string;
    hostelRating?: number;
    hostelFeedback?: string;
    extracurricularRating?: number;
    extracurricularFeedback?: string;
    improvementSuggestions?: string;

    // Files
    collegeImages?: File[];
    studentId?: File | null;
    markSheet?: File | null;
    degreeCertificate?: File | null;
    linkedinProfile?: string;
  }) => Promise<any>;
  reset: () => void;
}

export const useSubmitReview = (): UseSubmitReviewReturn => {
  const [state, setState] = useState<UseSubmitReviewState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const submitReviewAsync = async (payload: {
    userId?: number | null;
    collegeId?: number;
    courseId?: number;
    collegeLocation?: string;
    passYear?: number;
    isAnonymous?: boolean;
    stream?: string;
    yearOfStudy?: string;
    modeOfStudy?: string;
    currentSemester?: string;
    annualTuitionFees?: number;
    hostelFees?: number;
    otherCharges?: number;
    scholarshipAvailed?: boolean;
    scholarshipName?: string;
    scholarshipAmount?: number;

    reviewTitle?: string;
    overallSatisfactionRating?: number;
    overallExperienceFeedback?: string;
    teachingQualityRating?: number;
    teachingQualityFeedback?: string;
    infrastructureRating?: number;
    infrastructureFeedback?: string;
    libraryRating?: number;
    libraryFeedback?: string;
    placementSupportRating?: number;
    placementSupportFeedback?: string;
    administrativeSupportRating?: number;
    administrativeSupportFeedback?: string;
    hostelRating?: number;
    hostelFeedback?: string;
    extracurricularRating?: number;
    extracurricularFeedback?: string;
    improvementSuggestions?: string;
    collegeImages?: File[];
    studentId?: File | null;
    markSheet?: File | null;
    degreeCertificate?: File | null;
    linkedinProfile?: string;
  }): Promise<any> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const form = new FormData();

      // Add user_id if provided
      if (payload.userId) {
        form.append("user_id", String(payload.userId));
      }

      // Add college information (from step 2)
      if (payload.collegeId) {
        form.append("college_id", String(payload.collegeId));
      }
      if (payload.courseId) {
        form.append("course_id", String(payload.courseId));
      }
      if (payload.collegeLocation) {
        form.append("college_location", payload.collegeLocation);
      }
      if (payload.passYear) {
        form.append("pass_year", String(payload.passYear));
      }

      // Academic Information (from step 2)
      if (typeof payload.isAnonymous === "boolean") {
        form.append("is_anonymous", String(payload.isAnonymous));
      }
      if (payload.stream) {
        form.append("stream", payload.stream);
      }
      if (payload.yearOfStudy) {
        form.append("year_of_study", payload.yearOfStudy);
      }
      if (payload.modeOfStudy) {
        form.append("mode_of_study", payload.modeOfStudy);
      }
      if (payload.currentSemester) {
        form.append("current_semester", payload.currentSemester);
      }

      // Financial Information (from step 3)
      if (typeof payload.annualTuitionFees === "number") {
        form.append("annual_tuition_fees", String(payload.annualTuitionFees));
      }
      if (typeof payload.hostelFees === "number") {
        form.append("hostel_fees", String(payload.hostelFees));
      }
      if (typeof payload.otherCharges === "number") {
        form.append("other_charges", String(payload.otherCharges));
      }
      if (typeof payload.scholarshipAvailed === "boolean") {
        form.append("scholarship_availed", String(payload.scholarshipAvailed));
      }
      if (payload.scholarshipName) {
        form.append("scholarship_name", payload.scholarshipName);
      }
      if (typeof payload.scholarshipAmount === "number") {
        form.append("scholarship_amount", String(payload.scholarshipAmount));
      }

      // Feedback fields (from step 4)
      if (payload.reviewTitle) {
        form.append("review_title", payload.reviewTitle);
      }
      if (typeof payload.overallSatisfactionRating === "number") {
        form.append(
          "overall_satisfaction_rating",
          String(payload.overallSatisfactionRating)
        );
      }
      if (payload.overallExperienceFeedback) {
        form.append(
          "overall_experience_feedback",
          payload.overallExperienceFeedback
        );
      }
      if (typeof payload.teachingQualityRating === "number") {
        form.append(
          "teaching_quality_rating",
          String(payload.teachingQualityRating)
        );
      }
      if (payload.teachingQualityFeedback) {
        form.append(
          "teaching_quality_feedback",
          payload.teachingQualityFeedback
        );
      }
      if (typeof payload.infrastructureRating === "number") {
        form.append(
          "infrastructure_rating",
          String(payload.infrastructureRating)
        );
      }
      if (payload.infrastructureFeedback) {
        form.append("infrastructure_feedback", payload.infrastructureFeedback);
      }
      if (typeof payload.libraryRating === "number") {
        form.append("library_rating", String(payload.libraryRating));
      }
      if (payload.libraryFeedback) {
        form.append("library_feedback", payload.libraryFeedback);
      }
      if (typeof payload.placementSupportRating === "number") {
        form.append(
          "placement_support_rating",
          String(payload.placementSupportRating)
        );
      }
      if (payload.placementSupportFeedback) {
        form.append(
          "placement_support_feedback",
          payload.placementSupportFeedback
        );
      }
      if (typeof payload.administrativeSupportRating === "number") {
        form.append(
          "administrative_support_rating",
          String(payload.administrativeSupportRating)
        );
      }
      if (payload.administrativeSupportFeedback) {
        form.append(
          "administrative_support_feedback",
          payload.administrativeSupportFeedback
        );
      }
      if (typeof payload.hostelRating === "number") {
        form.append("hostel_rating", String(payload.hostelRating));
      }
      if (payload.hostelFeedback) {
        form.append("hostel_feedback", payload.hostelFeedback);
      }
      if (typeof payload.extracurricularRating === "number") {
        form.append(
          "extracurricular_rating",
          String(payload.extracurricularRating)
        );
      }
      if (payload.extracurricularFeedback) {
        form.append(
          "extracurricular_feedback",
          payload.extracurricularFeedback
        );
      }
      if (payload.improvementSuggestions) {
        form.append("improvement_suggestions", payload.improvementSuggestions);
      }

      // LinkedIn
      if (payload.linkedinProfile) {
        form.append("linkedin_profile", payload.linkedinProfile);
      }

      // Files: append each with expected field names
      if (payload.studentId)
        form.append(
          "student_id",
          payload.studentId,
          (payload.studentId as File).name
        );
      if (payload.markSheet)
        form.append(
          "mark_sheet",
          payload.markSheet,
          (payload.markSheet as File).name
        );
      if (payload.degreeCertificate)
        form.append(
          "degree_certificate",
          payload.degreeCertificate,
          (payload.degreeCertificate as File).name
        );

      // College images - append multiple
      if (payload.collegeImages && payload.collegeImages.length) {
        for (const img of payload.collegeImages) {
          form.append("college_images", img, img.name);
        }
      }

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `Failed to submit review: ${resp.status}`);
      }

      const data = await resp.json();

      setState((prev) => ({ ...prev, isLoading: false, data, error: null }));
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit review";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        data: null,
      }));
      throw error;
    }
  };

  const reset = () => {
    setState({ isLoading: false, error: null, data: null });
  };

  return { ...state, submitReviewAsync, reset };
};
