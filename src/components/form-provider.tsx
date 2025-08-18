"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  personalDetailsSchema,
  personalDetailsWithOtpSchema,
  studentReviewSchema,
  profileVerificationSchema,
} from "@/lib/validation-schemas";

interface FormData {
  // Personal Details
  name: string;
  email: string;
  gender: string;
  contactNumber: string;
  countryOfOrigin: string;
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
  profilePicture: File | undefined;
  linkedinProfile: string;
  studentId: File | undefined;
  markSheet: File | undefined;
  degreeCertificate: File | undefined;

  // Review Ratings and Comments
  collegePlacementTitle: string;

  academicExperienceComment: string;
  academicQualityRating: number;

  admissionExperienceComment: string;
  collegeAdmissionRating: number;

  placementJourneyComment: string;
  placementJourneyRating: number;

  campusExperienceComment: string;
  campusExperienceRating: number;

  // College Images
  collegeImages: File[];
}

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  personalDetailsForm: UseFormReturn<any>;
  studentReviewForm: UseFormReturn<any>;
  profileVerificationForm: UseFormReturn<any>;
  validateCurrentStep: (step: number) => Promise<boolean>;
  validatePersonalDetailsWithOtp: () => Promise<boolean>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialFormData: FormData = {
  name: "",
  email: "",
  gender: "",
  contactNumber: "",
  countryOfOrigin: "",
  collegeName: "",
  collegeId: 0,
  collegeLocation: "",
  courseName: "",
  courseId: 0,
  graduationYear: "",
  upiId: "",
  isEmailVerified: false,
  isPhoneVerified: false,
  profilePicture: undefined,
  linkedinProfile: "",
  studentId: undefined,
  markSheet: undefined,
  degreeCertificate: undefined,
  collegePlacementTitle: "",
  academicExperienceComment: "",
  academicQualityRating: 0,
  placementJourneyComment: "",
  placementJourneyRating: 0,
  collegeAdmissionRating: 0,
  admissionExperienceComment: "",
  campusExperienceComment: "",
  campusExperienceRating: 0,
  collegeImages: [],
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
      contactNumber: "",
      countryOfOrigin: "",
      collegeName: "",
      collegeId: 0,
      collegeLocation: "",
      courseName: "",
      courseId: 0,
      graduationYear: "",
      upiId: "",
      isEmailVerified: false,
      isPhoneVerified: false,
    },
    mode: "onChange",
  });

  const studentReviewForm = useForm({
    resolver: zodResolver(studentReviewSchema),
    defaultValues: {
      collegePlacementTitle: "",
      academicExperienceComment: "",
      academicQualityRating: 0,
      placementJourneyComment: "",
      placementJourneyRating: 0,
      collegeAdmissionRating: 0,
      admissionExperienceComment: "",
      campusExperienceComment: "",
      campusExperienceRating: 0,
      collegeImages: [],
    },
    mode: "onBlur", // Changed from onChange to onBlur for better UX
  });

  const profileVerificationForm = useForm({
    resolver: zodResolver(profileVerificationSchema),
    defaultValues: {
      profilePicture: undefined,
      linkedinProfile: "",
      studentId: undefined,
      markSheet: undefined,
      degreeCertificate: undefined,
    },
    mode: "onChange",
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
        const studentReviewValid = await studentReviewForm.trigger();
        console.log(
          "Student review validation:",
          studentReviewValid,
          studentReviewForm.formState.errors
        );
        return studentReviewValid;
      case 3:
        const profileValid = await profileVerificationForm.trigger();
        console.log(
          "Profile verification validation:",
          profileValid,
          profileVerificationForm.formState.errors
        );
        return profileValid;
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
        profileVerificationForm,
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
