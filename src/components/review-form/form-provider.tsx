"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================================
// SCHEMAS - Consolidated and simplified
// ============================================================================

export const personalDetailsSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  gender: z.string().min(1, "Please select gender"),
  dateOfBirth: z.string().min(1, "Please enter date of birth"),
  contactNumber: z.string().min(10, "Please enter a valid phone number"),
  iAm: z.string().min(1, "Please select your role"),
  collegeRollNumber: z.string().optional(),
  referralCode: z.string().optional(),
});

export const academicSchema = z.object({
  // College Info
  collegeName: z.string().min(1, "Please select a college"),
  collegeId: z.number().min(1, "Please select a college"),
  collegeLocation: z.string(),
  courseName: z.string().min(1, "Please select a course"),
  courseId: z.number().min(1, "Please select a course"),
  graduationYear: z.string().min(1, "Please select graduation year"),
  // Academic Details
  isAnonymous: z.boolean(),
  stream: z.string().optional(),
  yearOfStudy: z.string().optional(),
  modeOfStudy: z.string().optional(),
  currentSemester: z.string().optional(),
  // Financial
  annualTuitionFees: z.number().min(1, "Please enter tuition fees"),
  hostelFees: z.number(),
  otherCharges: z.number(),
  scholarshipAvailed: z.boolean(),
  scholarshipName: z.string().optional(),
  scholarshipAmount: z.number(),
});

export const feedbackSchema = z.object({
  reviewTitle: z.string().min(10, "Title must be at least 10 characters"),
  overallSatisfactionRating: z.number().min(1, "Please rate"),
  overallExperienceFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  teachingQualityRating: z.number().min(1, "Please rate"),
  teachingQualityFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  infrastructureRating: z.number().min(1, "Please rate"),
  infrastructureFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  libraryRating: z.number().min(1, "Please rate"),
  libraryFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  placementSupportRating: z.number().min(1, "Please rate"),
  placementSupportFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  administrativeSupportRating: z.number().min(1, "Please rate"),
  administrativeSupportFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  hostelRating: z.number().min(1, "Please rate"),
  hostelFeedback: z.string().min(100, "Please provide at least 100 characters"),
  extracurricularRating: z.number().min(1, "Please rate"),
  extracurricularFeedback: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  improvementSuggestions: z
    .string()
    .min(100, "Please provide at least 100 characters"),
  // Files
  collegeImages: z.array(z.instanceof(File)).min(1, "Upload at least 1 image"),
  linkedinProfile: z.string().optional(),
  studentId: z.instanceof(File).optional(),
  markSheet: z.instanceof(File).optional(),
  degreeCertificate: z.instanceof(File).optional(),
});

// ============================================================================
// TYPES
// ============================================================================

export type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;
export type AcademicForm = z.infer<typeof academicSchema>;
export type FeedbackForm = z.infer<typeof feedbackSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ReviewFormContextType {
  personalForm: UseFormReturn<PersonalDetailsForm, any, PersonalDetailsForm>;
  academicForm: UseFormReturn<AcademicForm, any, AcademicForm>;
  feedbackForm: UseFormReturn<FeedbackForm, any, FeedbackForm>;
  validateStep: (step: number) => Promise<boolean>;
  resetAllForms: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ReviewFormContext = createContext<ReviewFormContextType | null>(null);

export function ReviewFormProvider({ children }: { children: ReactNode }) {
  const personalForm = useForm<PersonalDetailsForm>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      contactNumber: "",
      iAm: "",
      collegeRollNumber: "",
      referralCode: "",
    },
    mode: "onChange",
  });

  const academicForm = useForm<AcademicForm>({
    resolver: zodResolver(academicSchema),
    defaultValues: {
      collegeName: "",
      collegeId: 0,
      collegeLocation: "",
      courseName: "",
      courseId: 0,
      graduationYear: "",
      isAnonymous: false,
      stream: "",
      yearOfStudy: "",
      modeOfStudy: "",
      currentSemester: "",
      annualTuitionFees: 0,
      hostelFees: 0,
      otherCharges: 0,
      scholarshipAvailed: false,
      scholarshipName: "",
      scholarshipAmount: 0,
    },
    mode: "onBlur",
  });

  const feedbackForm = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      reviewTitle: "",
      overallSatisfactionRating: 0,
      overallExperienceFeedback: "",
      teachingQualityRating: 0,
      teachingQualityFeedback: "",
      infrastructureRating: 0,
      infrastructureFeedback: "",
      libraryRating: 0,
      libraryFeedback: "",
      placementSupportRating: 0,
      placementSupportFeedback: "",
      administrativeSupportRating: 0,
      administrativeSupportFeedback: "",
      hostelRating: 0,
      hostelFeedback: "",
      extracurricularRating: 0,
      extracurricularFeedback: "",
      improvementSuggestions: "",
      collegeImages: [],
      linkedinProfile: "",
      studentId: undefined,
      markSheet: undefined,
      degreeCertificate: undefined,
    },
    mode: "onBlur",
  });

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1:
        return personalForm.trigger();
      case 2:
        return academicForm.trigger();
      case 3:
        return feedbackForm.trigger();
      default:
        return false;
    }
  };

  const resetAllForms = () => {
    personalForm.reset();
    academicForm.reset();
    feedbackForm.reset();
  };

  return (
    <ReviewFormContext.Provider
      value={{
        personalForm,
        academicForm,
        feedbackForm,
        validateStep,
        resetAllForms,
      }}
    >
      {children}
    </ReviewFormContext.Provider>
  );
}

export function useReviewForm() {
  const context = useContext(ReviewFormContext);
  if (!context) {
    throw new Error("useReviewForm must be used within ReviewFormProvider");
  }
  return context;
}
