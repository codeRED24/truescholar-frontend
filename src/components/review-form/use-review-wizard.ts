"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSession, signUp } from "@/lib/auth-client";
import {
  useReviewForm,
  type PersonalDetailsForm,
  type AcademicForm,
  type FeedbackForm,
} from "./form-provider";

interface UseReviewWizardReturn {
  // Auth state
  isAuthenticated: boolean;
  userId: string | undefined;
  isSessionLoading: boolean;

  // Step state
  currentStep: number;
  completedSteps: number[];
  isLastStep: boolean;

  // Loading states
  isLoading: boolean;
  isCreatingUser: boolean;
  isSubmitting: boolean;

  // Verification state
  showVerification: boolean;
  needsEmailVerification: boolean;
  needsPhoneVerification: boolean;
  verificationEmail: string;
  verificationPhone: string;

  // Submission state
  isSubmitted: boolean;
  referralCode: string | null;
  referredByCode: string | null;

  // Actions
  goToNextStep: () => Promise<void>;
  handleStepClick: (stepId: number) => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleReset: () => void;
  handleVerificationComplete: () => void;
}

export function useReviewWizard(): UseReviewWizardReturn {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    personalForm,
    academicForm,
    feedbackForm,
    validateStep,
    resetAllForms,
  } = useReviewForm();

  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id;
  const initialStep = isAuthenticated ? 2 : 1;

  // State
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    isAuthenticated ? [1] : []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Verification State
  const [showVerification, setShowVerification] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationPhone, setVerificationPhone] = useState("");

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredByCode, setReferredByCode] = useState<string | null>(null);

  const isLastStep = currentStep === 3;
  const isLoading = isCreatingUser || isSubmitting;

  // Sync step state when auth changes
  useEffect(() => {
    if (isAuthenticated && currentStep === 1) {
      setCompletedSteps([1]);
      setCurrentStep(2);
    }
  }, [isAuthenticated, currentStep]);

  // Check verification status for authenticated users
  useEffect(() => {
    if (isAuthenticated && session?.user && !isSessionLoading) {
      const user = session.user;
      // Use type assertion for plugin added fields if needed, or check existence
      // @ts-ignore - phoneNumberVerified comes from plugin
      const isEmailVerified = user.emailVerified as boolean;
      // @ts-ignore - phoneNumberVerified comes from plugin
      const isPhoneVerified = user.phoneNumberVerified as boolean;

      const needsEmail = !isEmailVerified;
      const needsPhone = !isPhoneVerified;

      if (needsEmail || needsPhone) {
        setNeedsEmailVerification(needsEmail);
        setNeedsPhoneVerification(needsPhone);
        setVerificationEmail(user.email || "");
        // @ts-ignore
        setVerificationPhone(user.phoneNumber || "");

        // Only show verification if we haven't completed it yet and we aren't already showing it
        if (!showVerification) {
          setShowVerification(true);
        }
      }
    }
  }, [isAuthenticated, session, isSessionLoading]);

  // Get referral from URL
  useEffect(() => {
    const urlRef = searchParams.get("ref");
    if (urlRef && !referredByCode) {
      setReferredByCode(urlRef);
      personalForm.setValue("referralCode", urlRef);
      toast.success(`🎉 Welcome! You've been referred by code: ${urlRef}`);
    }
  }, [searchParams, referredByCode, personalForm]);

  // Create user via Better Auth
  const createUser = useCallback(async (): Promise<boolean> => {
    const data = personalForm.getValues();
    setIsCreatingUser(true);

    try {
      const result = await signUp.email({
        email: data.email,
        password: Math.random().toString(36).slice(-12) + "Aa1!",
        name: data.name,
        gender: data.gender,
        dob: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        user_type: data.iAm,
        college_roll_number: data.collegeRollNumber,
        referred_by: referredByCode || data.referralCode || undefined,
        phoneNumber: data.contactNumber,
      } as Parameters<typeof signUp.email>[0]);

      if (result.error) {
        // Check for duplicate constraint errors (PostgreSQL error code 23505)
        const errorDetails = result.error as {
          message?: string;
          code?: string;
          details?: { code?: string; constraint?: string; detail?: string };
        };

        const isDuplicate =
          errorDetails.details?.code === "23505" ||
          errorDetails.code === "23505" ||
          errorDetails.message?.includes("already exists");

        if (isDuplicate) {
          const constraint = errorDetails.details?.constraint || "";
          const detail = errorDetails.details?.detail || "";

          let errorMessage =
            "An account with these credentials already exists.";
          if (
            constraint.includes("phoneNumber") ||
            detail.includes("phoneNumber")
          ) {
            errorMessage = "An account with this phone number already exists.";
          } else if (constraint.includes("email") || detail.includes("email")) {
            errorMessage = "An account with this email already exists.";
          }

          toast.error(`${errorMessage} Please sign in.`);
          router.push(
            `/login?redirect=/review-form${
              referredByCode ? `?ref=${referredByCode}` : ""
            }`
          );
          return false;
        }
        toast.error(errorDetails.message || "Failed to create account");
        return false;
      }

      toast.success("Account created!");

      // Setup verification
      setNeedsEmailVerification(true);
      setNeedsPhoneVerification(true);
      setVerificationEmail(data.email);
      setVerificationPhone(data.contactNumber);
      setShowVerification(true);

      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
      return false;
    } finally {
      setIsCreatingUser(false);
    }
  }, [personalForm, referredByCode, router]);

  // Mark step complete and advance
  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => [...prev.filter((s) => s !== step), step]);
    setCurrentStep((prev) => prev + 1);
  }, []);

  // Go to next step
  const goToNextStep = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    if (currentStep === 1 && !isAuthenticated) {
      const success = await createUser();
      // If success, createUser handles showing verification
      // We do NOT mark step complete here, user must finish verification first
      return;
    }

    markStepComplete(currentStep);
  }, [
    currentStep,
    isAuthenticated,
    validateStep,
    createUser,
    markStepComplete,
  ]);

  // Handle verification completion
  const handleVerificationComplete = useCallback(() => {
    setShowVerification(false);
    toast.success("Verification successful!");

    // If we were on step 1 (new user), complete it and move to step 2
    if (currentStep === 1) {
      markStepComplete(1);
    }
    // For existing users, they just stay on their current step (probably 2) but verification overlay disappears
  }, [currentStep, markStepComplete]);

  // Handle clicking on a step indicator
  const handleStepClick = useCallback(
    async (stepId: number) => {
      // Only allow clicking the next step
      if (stepId !== currentStep + 1) return;
      await goToNextStep();
    },
    [currentStep, goToNextStep]
  );

  // Submit the review
  const handleSubmit = useCallback(async () => {
    const isValid = await validateStep(3);
    if (!isValid) return;

    if (!userId) {
      toast.error("Please log in to submit your review.");
      return;
    }

    setIsSubmitting(true);

    try {
      const academic = academicForm.getValues();
      const feedback = feedbackForm.getValues();

      const form = new FormData();

      // User & College info
      form.append("user_id", userId);
      form.append("college_id", String(academic.collegeId));
      form.append("course_id", String(academic.courseId));
      form.append("college_location", academic.collegeLocation);
      form.append("pass_year", academic.graduationYear);
      form.append("is_anonymous", String(academic.isAnonymous));
      if (academic.stream) form.append("stream", academic.stream);
      if (academic.yearOfStudy)
        form.append("year_of_study", academic.yearOfStudy);
      if (academic.modeOfStudy)
        form.append("mode_of_study", academic.modeOfStudy);
      if (academic.currentSemester)
        form.append("current_semester", academic.currentSemester);

      // Financial
      form.append("annual_tuition_fees", String(academic.annualTuitionFees));
      form.append("hostel_fees", String(academic.hostelFees));
      form.append("other_charges", String(academic.otherCharges));
      form.append("scholarship_availed", String(academic.scholarshipAvailed));
      if (academic.scholarshipName)
        form.append("scholarship_name", academic.scholarshipName);
      form.append("scholarship_amount", String(academic.scholarshipAmount));

      // Feedback
      form.append("review_title", feedback.reviewTitle);
      form.append(
        "overall_satisfaction_rating",
        String(feedback.overallSatisfactionRating)
      );
      form.append(
        "overall_experience_feedback",
        feedback.overallExperienceFeedback
      );
      form.append(
        "teaching_quality_rating",
        String(feedback.teachingQualityRating)
      );
      form.append(
        "teaching_quality_feedback",
        feedback.teachingQualityFeedback
      );
      form.append(
        "infrastructure_rating",
        String(feedback.infrastructureRating)
      );
      form.append("infrastructure_feedback", feedback.infrastructureFeedback);
      form.append("library_rating", String(feedback.libraryRating));
      form.append("library_feedback", feedback.libraryFeedback);
      form.append(
        "placement_support_rating",
        String(feedback.placementSupportRating)
      );
      form.append(
        "placement_support_feedback",
        feedback.placementSupportFeedback
      );
      form.append(
        "administrative_support_rating",
        String(feedback.administrativeSupportRating)
      );
      form.append(
        "administrative_support_feedback",
        feedback.administrativeSupportFeedback
      );
      form.append("hostel_rating", String(feedback.hostelRating));
      form.append("hostel_feedback", feedback.hostelFeedback);
      form.append(
        "extracurricular_rating",
        String(feedback.extracurricularRating)
      );
      form.append("extracurricular_feedback", feedback.extracurricularFeedback);
      form.append("improvement_suggestions", feedback.improvementSuggestions);

      if (feedback.linkedinProfile)
        form.append("linkedin_profile", feedback.linkedinProfile);

      // Files
      if (feedback.studentId)
        form.append("student_id", feedback.studentId, feedback.studentId.name);
      if (feedback.markSheet)
        form.append("mark_sheet", feedback.markSheet, feedback.markSheet.name);
      if (feedback.degreeCertificate)
        form.append(
          "degree_certificate",
          feedback.degreeCertificate,
          feedback.degreeCertificate.name
        );

      for (const img of feedback.collegeImages) {
        form.append("college_images", img, img.name);
      }

      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        body: form,
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      const result = await resp.json();

      if (result?.custom_code) {
        setReferralCode(result.custom_code);
        toast.success(
          `Review submitted! Your referral code: ${result.custom_code}`
        );
      } else {
        toast.success("Review submitted successfully!");
      }

      resetAllForms();
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, academicForm, feedbackForm, validateStep, resetAllForms]);

  // Reset after submission
  const handleReset = useCallback(() => {
    setCurrentStep(isAuthenticated ? 2 : 1);
    setCompletedSteps(isAuthenticated ? [1] : []);
    setIsSubmitted(false);
    setReferralCode(null);
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    userId,
    isSessionLoading,
    currentStep,
    completedSteps,
    isLastStep,
    isLoading,
    isCreatingUser,
    isSubmitting,
    isSubmitted,
    referralCode,
    referredByCode,
    showVerification,
    needsEmailVerification,
    needsPhoneVerification,
    verificationEmail,
    verificationPhone,
    goToNextStep,
    handleStepClick,
    handleSubmit,
    handleReset,
    handleVerificationComplete,
  };
}
