import { z } from "zod";

// Personal Details Schema (Step 1 - without OTP verification requirement)
export const personalDetailsSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.email("Please enter a valid email address"),
  gender: z.string().min(1, "Please select a gender"),
  dateOfBirth: z
    .string()
    .min(1, "Please enter your date of birth")
    .refine((val) => {
      // Check if it's a valid date and user is at least 16 years old
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        return age - 1 >= 16;
      }
      return age >= 16;
    }, "You must be at least 16 years old")
    .refine((val) => {
      // Check if date is not in the future
      const date = new Date(val);
      const today = new Date();
      return date <= today;
    }, "Date of birth cannot be in the future"),
  contactNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .refine((val) => {
      // Remove all non-digit characters and check length
      const digitsOnly = val.replace(/\D/g, "");
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }, "Please enter a valid phone number (10-15 digits)")
    .refine((val) => {
      // Check if it's a valid international phone number format
      // Should start with + followed by country code
      return (
        /^\+[1-9]\d{1,14}$/.test(val) ||
        /^\d{10,15}$/.test(val.replace(/\D/g, ""))
      );
    }, "Please enter a valid phone number format"),
  countryOfOrigin: z.string().min(1, "Please select your country of origin"),
  upiId: z
    .string()
    .min(3, "UPI ID must be at least 3 characters")
    .max(50, "UPI ID must be less than 50 characters")
    .regex(
      /^[\w.-]+@[\w.-]+$/,
      "Please enter a valid UPI ID (e.g., username@paytm)"
    )
    .optional()
    .or(z.literal("")),

  // Optional verification flags - they are set after OTP verification
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
});

// Personal Details Schema with OTP verification requirement (for final validation)
export const personalDetailsWithOtpSchema = personalDetailsSchema.extend({
  isEmailVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your email"),
  isPhoneVerified: z
    .boolean()
    .refine((val) => val === true, "Please verify your phone number"),
});

// Student Review Schema
export const studentReviewSchema = z.object({
  // College Information (moved from personal details)
  collegeName: z.string().min(1, "Please select a college"),
  collegeId: z.number().min(1, "Please select a college"),
  collegeLocation: z.string().min(1, "Please select a college"),
  courseName: z.string().min(1, "Please select a course"),
  courseId: z.number().min(1, "Please select a course"),
  graduationYear: z.string().min(1, "Please select graduation year"),

  // Review content
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
export const completeFormSchema = personalDetailsWithOtpSchema
  .merge(studentReviewSchema)
  .merge(profileVerificationSchema);

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
export type PersonalDetailsWithOtpFormData = z.infer<
  typeof personalDetailsWithOtpSchema
>;
export type StudentReviewFormData = z.infer<typeof studentReviewSchema>;
export type ProfileVerificationFormData = z.infer<
  typeof profileVerificationSchema
>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;
