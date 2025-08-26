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
        return age - 1 >= 15;
      }
      return age >= 15;
    }, "You must be at least 15 years old")
    .refine((val) => {
      // Check if it's a valid date and user is not more than 60 years old
      const date = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        return age - 1 <= 60;
      }
      return age <= 60;
    }, "Your age must be smaller than 60 years")
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
  collegeRollNumber: z
    .string()
    .min(1, "Please enter your college roll number")
    .max(20, "College roll number must be less than 20 characters"),
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

// Academic Information Schema (Step 2)
export const academicInformationSchema = z.object({
  // College Information
  collegeName: z.string().min(1, "Please select a college"),
  collegeId: z.number().min(1, "Please select a college"),
  collegeLocation: z.string().min(1, "Please select a college"),
  courseName: z.string().min(1, "Please select a course"),
  courseId: z.number().min(1, "Please select a course"),
  graduationYear: z.string().min(1, "Please select graduation year"),

  // Academic Information
  isAnonymous: z.boolean().optional(),
  stream: z.string().optional(),
  yearOfStudy: z.string().optional(),
  modeOfStudy: z.string().optional(),
  currentSemester: z.string().optional(),
});

// Financial Information Schema (Step 3)
export const financialInformationSchema = z
  .object({
    // Financial Information
    annualTuitionFees: z.number().min(1, "Please enter annual tuition fees"),
    hostelFees: z.number().min(0, "Amount must be positive").optional(),
    otherCharges: z.number().min(0, "Amount must be positive").optional(),
    scholarshipAvailed: z.boolean(),
    scholarshipName: z.string().optional(),
    scholarshipAmount: z.number().min(0, "Amount must be positive").optional(),
  })
  .refine(
    (data) => {
      // If scholarship availed is true, scholarship name and amount are required
      if (data.scholarshipAvailed === true) {
        if (!data.scholarshipName || data.scholarshipName.trim() === "") {
          return false;
        }
        if (
          data.scholarshipAmount === undefined ||
          data.scholarshipAmount < 1
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Please provide scholarship name and amount when scholarship is availed",
      path: ["scholarshipName"], // This will show the error on scholarshipName field
    }
  );

// Combined Student Review Schema (includes both academic and financial)
export const studentReviewSchema = academicInformationSchema.merge(
  financialInformationSchema
);

// Feedback Schema (Step 4)
export const feedbackSchema = z.object({
  // Review title
  reviewTitle: z
    .string()
    .min(1, "Please provide a review title")
    .max(100, "Title must be less than 100 characters"),

  // Overall satisfaction - required with rating and feedback
  overallSatisfactionRating: z
    .number()
    .min(1, "Please rate overall satisfaction")
    .max(5, "Rating must be between 1 and 5"),
  overallExperienceFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Teaching quality - required rating, optional feedback
  teachingQualityRating: z
    .number()
    .min(1, "Please rate teaching quality")
    .max(5, "Rating must be between 1 and 5"),
  teachingQualityFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Infrastructure - required rating, optional feedback
  infrastructureRating: z
    .number()
    .min(1, "Please rate infrastructure")
    .max(5, "Rating must be between 1 and 5"),
  infrastructureFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Library and study resources - required rating, optional feedback
  libraryRating: z
    .number()
    .min(1, "Please rate library and study resources")
    .max(5, "Rating must be between 1 and 5"),
  libraryFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Placement support - required rating, optional feedback
  placementSupportRating: z
    .number()
    .min(1, "Please rate placement support")
    .max(5, "Rating must be between 1 and 5"),
  placementSupportFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Administrative support - required rating, optional feedback
  administrativeSupportRating: z
    .number()
    .min(1, "Please rate administrative support")
    .max(5, "Rating must be between 1 and 5"),
  administrativeSupportFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Hostel/accommodation - required rating, optional feedback
  hostelRating: z
    .number()
    .min(1, "Please rate hostel/accommodation")
    .max(5, "Rating must be between 1 and 5"),
  hostelFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Extra-curricular activities - required rating, optional feedback
  extracurricularRating: z
    .number()
    .min(1, "Please rate extra-curricular activities")
    .max(5, "Rating must be between 1 and 5"),
  extracurricularFeedback: z
    .string()
    .min(10, "Please provide detailed feedback (minimum 10 characters)")
    .max(2500, "Feedback must be less than 2500 characters"),

  // Suggestions for improvement - required
  improvementSuggestions: z
    .string()
    .min(
      10,
      "Please provide suggestions for improvement (minimum 10 characters)"
    )
    .max(2500, "Suggestions must be less than 2500 characters"),

  // College images - required (at least 1, max 6)
  collegeImages: z
    .array(z.instanceof(File))
    .min(1, "Please upload at least one college image")
    .max(6, "You can upload maximum 6 images"),
});

// Profile Verification Schema (Step 5)
export const profileVerificationSchema = z.object({
  // Profile verification fields
  profilePicture: z.instanceof(File, {
    message: "Please upload a profile picture",
  }),
  linkedinProfile: z
    .string()
    .url("Please enter a valid LinkedIn profile URL")
    .refine(
      (url) => /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(url),
      "Please enter a valid LinkedIn profile URL"
    )
    .optional()
    .or(z.literal("")),
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
  .merge(feedbackSchema)
  .merge(profileVerificationSchema);

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
export type PersonalDetailsWithOtpFormData = z.infer<
  typeof personalDetailsWithOtpSchema
>;
export type AcademicInformationFormData = z.infer<
  typeof academicInformationSchema
>;
export type FinancialInformationFormData = z.infer<
  typeof financialInformationSchema
>;
export type StudentReviewFormData = z.infer<typeof studentReviewSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type ProfileVerificationFormData = z.infer<
  typeof profileVerificationSchema
>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;
export type OtpVerificationFormData = z.infer<typeof otpVerificationSchema>;
