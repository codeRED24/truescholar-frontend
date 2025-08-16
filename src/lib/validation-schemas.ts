import { z } from "zod";

// Personal Details Schema
export const personalDetailsSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  gender: z.string().min(1, "Please select a gender"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number must be less than 15 digits")
    .regex(/^\d+$/, "Contact number must contain only digits"),
  countryCode: z.string().min(1, "Please select a country code"),
  countryOfOrigin: z.string().min(1, "Please select your country of origin"),
  collegeName: z
    .string()
    .min(2, "College name must be at least 2 characters")
    .max(100, "College name must be less than 100 characters"),
  collegeLocation: z
    .string()
    .min(2, "College location must be at least 2 characters")
    .max(100, "College location must be less than 100 characters"),
  courseName: z.string().min(1, "Please select a course"),
  graduationYear: z.string().min(1, "Please select graduation year"),
  upiId: z
    .string()
    .min(3, "UPI ID must be at least 3 characters")
    .max(50, "UPI ID must be less than 50 characters")
    .regex(
      /^[\w.-]+@[\w.-]+$/,
      "Please enter a valid UPI ID (e.g., username@paytm)"
    ),
  isEmailVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your email"),
  isPhoneVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your phone number"),
});

// Student Review Schema
export const studentReviewSchema = z.object({
  collegePlacementTitle: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),

  academicExperienceComment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2500, "Comment must be less than 2500 characters"),
  academicQualityRating: z
    .number()
    .min(1, "Please rate academic quality")
    .max(5, "Rating must be between 1 and 5"),

  placementJourneyComment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2500, "Comment must be less than 2500 characters"),
  placementJourneyRating: z
    .number()
    .min(1, "Please rate placement journey")
    .max(5, "Rating must be between 1 and 5"),

  collegeAdmissionRating: z
    .number()
    .min(1, "Please rate college admission process")
    .max(5, "Rating must be between 1 and 5"),
  admissionExperienceComment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2500, "Comment must be less than 2500 characters"),

  campusExperienceComment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2500, "Comment must be less than 2500 characters"),

  campusExperienceRating: z
    .number()
    .min(1, "Please rate campus experience")
    .max(5, "Rating must be between 1 and 5"),

  collegeImages: z
    .array(z.instanceof(File))
    .min(1, "Please upload at least one college image")
    .max(6, "You can upload maximum 6 images"),
});

// Profile Verification Schema
export const profileVerificationSchema = z.object({
  profilePicture: z.instanceof(File, {
    message: "Please upload a profile picture",
  }),
  linkedinProfile: z
    .string()
    .url("Please enter a valid LinkedIn profile URL")
    .refine(
      (url) => /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(url),
      "Please enter a valid LinkedIn profile URL"
    ),
  studentId: z.instanceof(File, { message: "Please upload your student ID" }),
  markSheet: z.instanceof(File, { message: "Please upload your mark sheet" }),
  degreeCertificate: z.instanceof(File, {
    message: "Please upload your degree certificate",
  }),
});

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  emailOtp: z
    .string()
    .length(6, "Email OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "Email OTP must contain only digits"),
  phoneOtp: z
    .string()
    .length(6, "Phone OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "Phone OTP must contain only digits"),
  isEmailVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your email"),
  isPhoneVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your phone number"),
});

// Combined schema for complete form
export const completeFormSchema = personalDetailsSchema
  .merge(studentReviewSchema)
  .merge(profileVerificationSchema);

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
export type StudentReviewFormData = z.infer<typeof studentReviewSchema>;
export type ProfileVerificationFormData = z.infer<
  typeof profileVerificationSchema
>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;
