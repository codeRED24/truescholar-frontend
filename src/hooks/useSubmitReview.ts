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
    // fields mapped from step2 and step3
    reviewTitle?: string;
    collegeAdmissionComment?: string;
    campusExperienceComment?: string;
    placementJourneyComment?: string;
    academicExperienceComment?: string;
    collegeAdmissionRating?: number;
    campusExperienceRating?: number;
    placementJourneyRating?: number;
    academicExperienceRating?: number;
    collegeImages?: File[];
    // profile verification files and fields
    profilePicture?: File | null;
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
    reviewTitle?: string;
    collegeAdmissionComment?: string;
    campusExperienceComment?: string;
    placementJourneyComment?: string;
    academicExperienceComment?: string;
    collegeAdmissionRating?: number;
    campusExperienceRating?: number;
    placementJourneyRating?: number;
    academicExperienceRating?: number;
    collegeImages?: File[];
    profilePicture?: File | null;
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

      // Map simple fields
      if (payload.reviewTitle) form.append("review_title", payload.reviewTitle);
      if (payload.collegeAdmissionComment)
        form.append(
          "college_admission_comment",
          payload.collegeAdmissionComment
        );
      if (payload.campusExperienceComment)
        form.append(
          "campus_experience_comment",
          payload.campusExperienceComment
        );
      if (payload.placementJourneyComment)
        form.append(
          "placement_journey_comment",
          payload.placementJourneyComment
        );
      if (payload.academicExperienceComment)
        form.append(
          "academic_experience_comment",
          payload.academicExperienceComment
        );

      // Ratings
      if (typeof payload.collegeAdmissionRating === "number")
        form.append(
          "college_admission_rating",
          String(payload.collegeAdmissionRating)
        );
      if (typeof payload.campusExperienceRating === "number")
        form.append(
          "campus_experience_rating",
          String(payload.campusExperienceRating)
        );
      if (typeof payload.placementJourneyRating === "number")
        form.append(
          "placement_journey_rating",
          String(payload.placementJourneyRating)
        );
      if (typeof payload.academicExperienceRating === "number")
        form.append(
          "academic_experience_rating",
          String(payload.academicExperienceRating)
        );

      // LinkedIn
      if (payload.linkedinProfile)
        form.append("linkedin_profile", payload.linkedinProfile);

      // Files: append each with expected field names
      if (payload.profilePicture)
        form.append(
          "profile_picture",
          payload.profilePicture,
          (payload.profilePicture as File).name
        );
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
