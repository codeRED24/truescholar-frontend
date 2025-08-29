"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  personalDetailsSchema,
  personalDetailsWithOtpSchema,
  studentReviewSchema,
  feedbackSchema,
} from "@/lib/validation-schemas";

interface FormData {
  // Personal Details
  name: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  contactNumber: string;
  countryOfOrigin: string;
  collegeRollNumber: string;
  iAm: string;
  college: string;
  referralCode: string;
  collegeName: string;
  collegeId: number;
  collegeLocation: string;
  courseName: string;
  courseId: number;
  graduationYear: string;
  upiId: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;

  // Student Review
  isAnonymous: boolean;
  stream: string;
  yearOfStudy: string;
  modeOfStudy: string;
  currentSemester: string;

  // Financial Information
  annualTuitionFees: number;
  hostelFees: number;
  otherCharges: number;
  scholarshipAvailed: boolean;
  scholarshipName: string;
  scholarshipAmount: number;

  // Feedback & Review Fields
  reviewTitle: string;
  overallSatisfactionRating: number;
  overallExperienceFeedback: string;
  teachingQualityRating: number;
  teachingQualityFeedback: string;
  infrastructureRating: number;
  infrastructureFeedback: string;
  libraryRating: number;
  libraryFeedback: string;
  placementSupportRating: number;
  placementSupportFeedback: string;
  administrativeSupportRating: number;
  administrativeSupportFeedback: string;
  hostelRating: number;
  hostelFeedback: string;
  extracurricularRating: number;
  extracurricularFeedback: string;
  improvementSuggestions: string;
  collegeImages: File[];

  linkedinProfile: string;
  studentId: File | undefined;
  markSheet: File | undefined;
  degreeCertificate: File | undefined;
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  personalDetailsForm: UseFormReturn<any>;
  studentReviewForm: UseFormReturn<any>;
  feedbackForm: UseFormReturn<any>;
  validateCurrentStep: (step: number) => Promise<boolean>;
  validatePersonalDetailsWithOtp: () => Promise<boolean>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const initialFormData: FormData = {
  name: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  contactNumber: "",
  countryOfOrigin: "",
  collegeRollNumber: "",
  iAm: "",
  college: "",
  referralCode: "",
  upiId: "",
  isEmailVerified: false,
  isPhoneVerified: false,
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

  // College information now in step 2
  collegeName: "",
  collegeId: 0,
  collegeLocation: "",
  courseName: "",
  courseId: 0,
  graduationYear: "",
};

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const personalDetailsForm = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      dateOfBirth: "",
      contactNumber: "",
      collegeRollNumber: "",
      iAm: "",
      college: "",
      referralCode: "",
      upiId: "",
      isEmailVerified: false,
      isPhoneVerified: false,
    },
    mode: "onChange",
  });

  const studentReviewForm = useForm({
    resolver: zodResolver(studentReviewSchema),
    defaultValues: {
      // College Information
      collegeName: "",
      collegeId: 0,
      collegeLocation: "",
      courseName: "",
      courseId: 0,
      graduationYear: "",
      // Academic Information
      isAnonymous: false,
      stream: "",
      yearOfStudy: "",
      modeOfStudy: "",
      currentSemester: "",
      // Financial Information
      annualTuitionFees: 0,
      hostelFees: 0,
      otherCharges: 0,
      scholarshipAvailed: false,
      scholarshipName: "",
      scholarshipAmount: 0,
    },
    mode: "onBlur",
  });

  const feedbackForm = useForm({
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
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateCurrentStep = async (step: number): Promise<boolean> => {
    console.log(`Validating step ${step}`);
    switch (step) {
      case 1:
        const personalValid = await personalDetailsForm.trigger();
        console.log(
          "Personal details validation:",
          personalValid,
          personalDetailsForm.formState.errors
        );
        return personalValid;
      case 2:
        // Validate both academic and financial information fields for step 2
        const academicValid = await studentReviewForm.trigger([
          "collegeName",
          "collegeId",
          "collegeLocation",
          "courseName",
          "courseId",
          "graduationYear",
        ]);
        const financialValid = await studentReviewForm.trigger([
          "annualTuitionFees",
          "hostelFees",
          "otherCharges",
          "scholarshipAvailed",
          "scholarshipName",
          "scholarshipAmount",
        ]);
        console.log(
          "Academic information validation:",
          academicValid,
          studentReviewForm.formState.errors
        );
        console.log(
          "Financial information validation:",
          financialValid,
          studentReviewForm.formState.errors
        );
        return academicValid && financialValid;
      case 3:
        // Validate feedback form for step 3
        const feedbackValid = await feedbackForm.trigger();
        console.log(
          "Feedback validation:",
          feedbackValid,
          feedbackForm.formState.errors
        );
        return feedbackValid;
      default:
        return false;
    }
  };

  const validatePersonalDetailsWithOtp = async (): Promise<boolean> => {
    const currentValues = personalDetailsForm.getValues();
    try {
      await personalDetailsWithOtpSchema.parseAsync(currentValues);
      return true;
    } catch (error) {
      console.log("Personal details with OTP validation failed:", error);
      return false;
    }
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        updateFormData,
        errors,
        setErrors,
        personalDetailsForm,
        studentReviewForm,
        feedbackForm,
        validateCurrentStep,
        validatePersonalDetailsWithOtp,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
