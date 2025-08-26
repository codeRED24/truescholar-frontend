"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonalDetailsStep } from "@/components/form-steps/personal-details-step";
import { StudentReviewStep } from "@/components/form-steps/student-review-step";
import { FinancialInformationStep } from "@/components/form-steps/financial-information-step";
import { FeedbackStep } from "@/components/form-steps/feedback-step";
import { ProfileVerificationStep } from "@/components/form-steps/profile-verification-step";
import { SuccessScreen } from "@/components/success-screen";
import {
  FormProvider,
  useFormContext,
  initialFormData,
} from "@/components/form-provider";
import { OtpVerificationDialog } from "@/components/otp-verification-dialog";
import { LoginDialog } from "@/components/modals/LoginDialog";
import { CheckCircle, Circle, Gift } from "lucide-react";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { CreateUserRequest } from "@/api/users/createUser";
import useOtpApi from "@/hooks/use-otp";
import { toast } from "sonner";
import { getCurrentLocation } from "@/utils/location";
import { useSearchParams } from "next/navigation";

const OTP_COOLDOWN_SECONDS = 30;

const STEPS = [
  { id: 1, title: "Personal Details", component: PersonalDetailsStep },
  { id: 2, title: "Academic Information", component: StudentReviewStep },
  {
    id: 3,
    title: "Financial Information",
    component: FinancialInformationStep,
  },
  { id: 4, title: "Feedback", component: FeedbackStep },
  { id: 5, title: "Profile Verification", component: ProfileVerificationStep },
];

function ReviewFormContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredByCode, setReferredByCode] = useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [existingUserData, setExistingUserData] = useState<{
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [lastCreatedUserData, setLastCreatedUserData] =
    useState<CreateUserRequest | null>(null);
  const [otpSentCount, setOtpSentCount] = useState(0);
  const [lastOtpSentTime, setLastOtpSentTime] = useState<number | null>(null);
  const [otpsAlreadySent, setOtpsAlreadySent] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(true);

  // Get referral code from URL parameters
  const searchParams = useSearchParams();

  // Detect referral code from URL on component mount
  useEffect(() => {
    const urlReferralCode = searchParams.get("ref");
    if (urlReferralCode) {
      setReferredByCode(urlReferralCode);
      toast.success(
        `🎉 Welcome! You've been referred by code: ${urlReferralCode}`
      );
    }
  }, [searchParams]);

  const {
    createUserAsync,
    isLoading: isCreatingUser,
    error: createUserError,
  } = useCreateUser();

  const {
    submitReviewAsync,
    isLoading: isSubmittingReview,
    error: submitReviewError,
  } = useSubmitReview();

  const {
    sendEmailOtp,
    sendPhoneOtp,
    loading: otpLoading,
    error: otpError,
  } = useOtpApi();

  // Update canResendOtp state periodically
  useEffect(() => {
    const updateCanResend = () => {
      setCanResendOtp(canSendOtp());
    };

    // Update immediately
    updateCanResend();

    // Update every second when dialog is open
    const interval = showOtpDialog ? setInterval(updateCanResend, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtpDialog, otpSentCount, lastOtpSentTime]);

  const {
    validateCurrentStep,
    validatePersonalDetailsWithOtp,
    studentReviewForm,
    feedbackForm,
    profileVerificationForm,
    personalDetailsForm,
  } = useFormContext();

  const { updateFormData } = useFormContext();

  // Helper function to check if form data has changed since last user creation
  const hasFormDataChanged = (currentData: CreateUserRequest) => {
    if (!lastCreatedUserData) return true;

    return (
      currentData.name !== lastCreatedUserData.name ||
      currentData.email !== lastCreatedUserData.email ||
      currentData.gender !== lastCreatedUserData.gender ||
      currentData.dob !== lastCreatedUserData.dob ||
      currentData.contact_number !== lastCreatedUserData.contact_number ||
      currentData.country_of_origin !== lastCreatedUserData.country_of_origin
    );
  };

  // Helper function to check if we can send OTP (rate limiting)
  const canSendOtp = () => {
    const now = Date.now();
    const cooldownPeriod = 30000; // 30 second cooldown (matches countdown)
    const maxOtpCount = 3; // Max 3 OTP attempts per session

    if (otpSentCount >= maxOtpCount) {
      // console.log("Maximum OTP attempts reached");
      return false;
    }

    if (lastOtpSentTime && now - lastOtpSentTime < cooldownPeriod) {
      // console.log(`OTP cooldown period active. ${Math.ceil((cooldownPeriod - (now - lastOtpSentTime)) / 1000)}s remaining`);
      return false;
    }

    return true;
  };

  // Helper function to check if limit is reached (for UI display)
  const isLimitReached = () => {
    return otpSentCount >= 5;
  };

  // Function to send OTPs with rate limiting
  const sendOtpsIfNeeded = async () => {
    const step1Data = personalDetailsForm.getValues();
    const email = step1Data.email;
    const phone = step1Data.contactNumber;
    const countryCode = step1Data.countryCode;

    // If OTPs were already sent for this session and email/phone haven't changed, don't send again
    if (
      otpsAlreadySent &&
      !hasFormDataChanged({
        name: step1Data.name,
        email: step1Data.email,
        gender: step1Data.gender,
        dob: step1Data.dateOfBirth,
        contact_number: step1Data.contactNumber,
        country_of_origin: step1Data.countryOfOrigin,
        college_id: step1Data.collegeId,
        course_id: step1Data.courseId,
        college_location: step1Data.collegeLocation,
        pass_year: step1Data.graduationYear,
        user_type: "student",
      })
    ) {
      // console.log("OTPs already sent for current data");
      return;
    }

    if (!canSendOtp()) {
      // console.log("Cannot send OTP due to rate limiting");
      return;
    }

    try {
      // console.log("Sending OTPs...");
      await Promise.all([
        sendEmailOtp(email),
        sendPhoneOtp(phone, countryCode),
      ]);

      setOtpSentCount((prev) => prev + 1);
      setLastOtpSentTime(Date.now());
      setOtpsAlreadySent(true);
      // console.log("OTPs sent successfully");
    } catch (error) {
      console.error("Failed to send OTPs:", error);
    }
  };

  // Function for manual email OTP resend
  const resendEmailOtp = async () => {
    if (!canSendOtp()) {
      // console.log("Cannot resend email OTP due to rate limiting");
      return;
    }

    const step1Data = personalDetailsForm.getValues();
    const email = step1Data.email;

    try {
      // console.log("Resending email OTP...");
      await sendEmailOtp(email);

      setOtpSentCount((prev) => prev + 1);
      setLastOtpSentTime(Date.now());
      // console.log("Email OTP resent successfully");
    } catch (error) {
      console.error("Failed to resend email OTP:", error);
      throw error;
    }
  };

  // Function for manual phone OTP resend
  const resendPhoneOtp = async () => {
    if (!canSendOtp()) {
      // console.log("Cannot resend phone OTP due to rate limiting");
      return;
    }

    const step1Data = personalDetailsForm.getValues();
    const phone = step1Data.contactNumber;
    const countryCode = step1Data.countryCode;

    try {
      // console.log("Resending phone OTP...");
      await sendPhoneOtp(phone, countryCode);

      setOtpSentCount((prev) => prev + 1);
      setLastOtpSentTime(Date.now());
      // console.log("Phone OTP resent successfully");
    } catch (error) {
      console.error("Failed to resend phone OTP:", error);
      throw error;
    }
  };

  // Calculate countdown time remaining
  const countdown = useMemo(() => {
    if (!lastOtpSentTime) return 0;
    const elapsed = Math.floor((Date.now() - lastOtpSentTime) / 1000);
    const remaining = Math.max(0, OTP_COOLDOWN_SECONDS - elapsed);
    return remaining;
  }, [lastOtpSentTime]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (isValid) {
      if (currentStep === 1) {
        // Console log all fields from step 1 (Personal Details) before asking for OTPs
        const step1Data = personalDetailsForm.getValues();

        // Get user location if available
        const userLocation = await getCurrentLocation();

        // Create user payload (without college information)
        const userPayload: CreateUserRequest = {
          name: step1Data.name,
          email: step1Data.email,
          gender: step1Data.gender,
          dob: step1Data.dateOfBirth,
          contact_number: step1Data.contactNumber,
          country_of_origin: step1Data.countryOfOrigin,
          college_roll_number: step1Data.collegeRollNumber,
          user_location: userLocation || undefined,
          user_type: "student", // Default user type for review form
        };

        // Only create user if we haven't created one yet or if the data has changed
        if (!createdUserId || hasFormDataChanged(userPayload)) {
          try {
            // console.log("Creating user with payload:", userPayload);
            const userResponse = await createUserAsync(userPayload);
            // console.log("User response:", userResponse);

            setCreatedUserId(userResponse.data.id);
            setLastCreatedUserData(userPayload);
            // Reset OTP state when user data changes
            setOtpsAlreadySent(false);

            // Check if user is existing (status 200) or new (status 201)
            if (userResponse.status === 200) {
              // Existing user - show login dialog
              setExistingUserData({
                name: userResponse.data.name,
                email: userResponse.data.email,
                phone: userResponse.data.contact_number,
              });
              setShowLoginDialog(true);
              return; // Don't proceed to next step yet
            } else if (userResponse.status === 201) {
              // New user - send OTPs and show OTP dialog
              await sendOtpsIfNeeded();
              setShowOtpDialog(true);
            }
          } catch (error) {
            console.error("Failed to create user:", error);
            return; // Don't proceed if user creation fails
          }
        } else {
          // console.log("User already created, skipping user creation");
          // If user is already created, proceed to send OTPs
          await sendOtpsIfNeeded();
          setShowOtpDialog(true);
        }
      } else if (currentStep < STEPS.length) {
        // For other steps, proceed normally
        setCompletedSteps((prev) => [
          ...prev.filter((s) => s !== currentStep),
          currentStep,
        ]);
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleOtpVerificationSuccess = async () => {
    // After OTP verification is complete, validate with OTP requirements
    const isValidWithOtp = await validatePersonalDetailsWithOtp();
    if (isValidWithOtp) {
      setCompletedSteps((prev) => [...prev.filter((s) => s !== 1), 1]);
      setCurrentStep(2);
      setShowOtpDialog(false);
    }
  };

  const handleCloseOtpDialog = () => {
    setShowOtpDialog(false);
  };

  const handleLoginSuccess = () => {
    // After successful login, proceed to next step
    setCompletedSteps((prev) => [...prev.filter((s) => s !== 1), 1]);
    setCurrentStep(2);
    setShowLoginDialog(false);
  };

  const handleCloseLoginDialog = () => {
    setShowLoginDialog(false);
    setExistingUserData(null);
  };

  // const handlePrevious = () => {
  //   // going back removed: no-op
  // };

  const handleStepClick = async (stepId: number) => {
    // Disable going back via step clicks. Allow only advancing to the next step
    // when clicking the immediate next step after validation.
    if (stepId === currentStep + 1) {
      const isValid = await validateCurrentStep(currentStep);
      if (isValid) {
        if (currentStep === 1) {
          // Get current form data
          const step1Data = personalDetailsForm.getValues();

          // Get user location if available
          const userLocation = await getCurrentLocation();

          const userPayload: CreateUserRequest = {
            name: step1Data.name,
            email: step1Data.email,
            gender: step1Data.gender,
            dob: step1Data.dateOfBirth,
            contact_number: step1Data.contactNumber,
            country_of_origin: step1Data.countryOfOrigin,
            user_location: userLocation || undefined,
            user_type: "student",
          };

          // Only create user if we haven't created one yet or if the data has changed
          if (!createdUserId || hasFormDataChanged(userPayload)) {
            try {
              // console.log("Creating user with payload:", userPayload);
              const userResponse = await createUserAsync(userPayload);
              // console.log("User created successfully:", userResponse);
              setCreatedUserId(userResponse.data.id);
              setLastCreatedUserData(userPayload);
              // Reset OTP state when user data changes
              setOtpsAlreadySent(false);
            } catch (error) {
              console.error("Failed to create user:", error);
              return;
            }
          } else {
            // console.log("User already created, skipping user creation");
          }

          // Send OTPs if needed before showing dialog
          await sendOtpsIfNeeded();

          // For step 1, show OTP verification dialog
          setShowOtpDialog(true);
        } else {
          // For other steps, proceed normally
          setCompletedSteps((prev) => [
            ...prev.filter((s) => s !== currentStep),
            currentStep,
          ]);
          setCurrentStep(stepId);
        }
      }
    }
    // All other clicks (including earlier steps) are ignored to prevent going back.
  };

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (!isValid) return;

    // Ensure we have a user ID before submitting
    if (!createdUserId) {
      console.error("No user ID available for review submission");
      toast.error("User information is missing. Please go back to step 1.");
      return;
    }

    setIsSubmitting(true);

    // Get data from all steps
    const step2Data = studentReviewForm.getValues();
    const financialData = studentReviewForm.getValues(); // Financial data is in the same form
    const feedbackData = feedbackForm.getValues(); // Get feedback data from step 4
    const profileData = profileVerificationForm.getValues();

    // Console log data from all steps excluding step 1
    console.log("Step 2 (Academic Information) Data:", {
      collegeName: step2Data.collegeName,
      collegeId: step2Data.collegeId,
      collegeLocation: step2Data.collegeLocation,
      courseName: step2Data.courseName,
      courseId: step2Data.courseId,
      graduationYear: step2Data.graduationYear,
      isAnonymous: step2Data.isAnonymous,
      stream: step2Data.stream,
      yearOfStudy: step2Data.yearOfStudy,
      modeOfStudy: step2Data.modeOfStudy,
      currentSemester: step2Data.currentSemester,
    });

    console.log("Step 3 (Financial Information) Data:", {
      annualTuitionFees: step2Data.annualTuitionFees,
      hostelFees: step2Data.hostelFees,
      otherCharges: step2Data.otherCharges,
      scholarshipAvailed: step2Data.scholarshipAvailed,
      scholarshipName: step2Data.scholarshipName,
      scholarshipAmount: step2Data.scholarshipAmount,
    });

    console.log("Step 4 (Feedback) Data:", feedbackData);
    console.log("Step 5 (Profile Verification) Data:", profileData);

    // Map frontend fields to backend DTO + files and submit via hook
    try {
      const payload = {
        // User ID - CRITICAL: This links the review to the user
        userId: createdUserId,

        // College Information (from step 2)
        collegeId: step2Data.collegeId,
        courseId: step2Data.courseId,
        collegeLocation: step2Data.collegeLocation,
        passYear: parseInt(step2Data.graduationYear),

        // Financial Information (from step 2/3)
        annualTuitionFees: step2Data.annualTuitionFees,
        hostelFees: step2Data.hostelFees,
        otherCharges: step2Data.otherCharges,
        scholarshipAvailed: step2Data.scholarshipAvailed,
        scholarshipName: step2Data.scholarshipName,
        scholarshipAmount: step2Data.scholarshipAmount,

        // Feedback from step 4 - this is the main review content
        reviewTitle: feedbackData.reviewTitle,

        // Overall satisfaction (required)
        overallSatisfactionRating: feedbackData.overallSatisfactionRating,
        overallExperienceFeedback: feedbackData.overallExperienceFeedback,

        // All rating categories (all required as per step 4)
        teachingQualityRating: feedbackData.teachingQualityRating,
        teachingQualityFeedback: feedbackData.teachingQualityFeedback || "",
        infrastructureRating: feedbackData.infrastructureRating,
        infrastructureFeedback: feedbackData.infrastructureFeedback || "",
        libraryRating: feedbackData.libraryRating,
        libraryFeedback: feedbackData.libraryFeedback || "",
        placementSupportRating: feedbackData.placementSupportRating,
        placementSupportFeedback: feedbackData.placementSupportFeedback || "",
        administrativeSupportRating: feedbackData.administrativeSupportRating,
        administrativeSupportFeedback:
          feedbackData.administrativeSupportFeedback || "",
        hostelRating: feedbackData.hostelRating,
        hostelFeedback: feedbackData.hostelFeedback || "",
        extracurricularRating: feedbackData.extracurricularRating,
        extracurricularFeedback: feedbackData.extracurricularFeedback || "",
        improvementSuggestions: feedbackData.improvementSuggestions,

        // College images from step 4
        collegeImages: feedbackData.collegeImages || [],

        // Profile verification fields
        profilePicture: profileData.profilePicture || null,
        studentId: profileData.studentId || null,
        markSheet: profileData.markSheet || null,
        degreeCertificate: profileData.degreeCertificate || null,
        linkedinProfile: profileData.linkedinProfile || undefined,
      };

      // Submit using our hook
      const result = await submitReviewAsync(payload as any);
      // console.log("Review submitted successfully:", result);

      // Store the custom_code as referral code
      if (result?.custom_code) {
        // console.log("User custom code:", result.custom_code);
        setReferralCode(result.custom_code);
        toast.success(
          `Review submitted successfully! Your referral code: ${result.custom_code}`
        );
      } else {
        // console.log("No custom_code received in response");
        toast.success("Review submitted successfully");
      }
      // Clear form data after successful submission
      try {
        // Reset each react-hook-form instance to their default values
        personalDetailsForm.reset();
        studentReviewForm.reset();
        feedbackForm.reset();
        profileVerificationForm.reset();

        // Reset provider-level aggregated formData
        updateFormData(initialFormData);

        // Reset local component state related to user/OTP
        setCreatedUserId(null);
        setLastCreatedUserData(null);
        setOtpSentCount(0);
        setLastOtpSentTime(null);
        setOtpsAlreadySent(false);
        setCanResendOtp(true);
        // Note: Don't reset referralCode here - we need it for the success screen
      } catch (resetError) {
        console.warn("Failed to reset forms after submit:", resetError);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsSubmitted(false);
    setIsSubmitting(false);
    setShowOtpDialog(false);
    setShowLoginDialog(false);
    setExistingUserData(null);
    setCreatedUserId(null);
    setLastCreatedUserData(null);
    setOtpSentCount(0);
    setLastOtpSentTime(null);
    setOtpsAlreadySent(false);
    setCanResendOtp(true);
    setReferralCode(null);
  };

  if (isSubmitted) {
    // console.log("Success screen - referralCode:", referralCode);
    return <SuccessScreen onReset={handleReset} referralCode={referralCode} />;
  }

  const CurrentStepComponent = STEPS.find(
    (step) => step.id === currentStep
  )?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Referral Banner */}
        {referredByCode && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="font-semibold text-teal-800">Welcome! 🎉</h3>
                <p className="text-sm text-teal-700">
                  You've been referred by code:{" "}
                  <code className="bg-teal-100 px-2 py-1 rounded text-teal-900 font-mono">
                    {referredByCode}
                  </code>
                </p>
                <p className="text-xs text-teal-600 mt-1">
                  Complete your review to help both you and your referrer earn
                  rewards!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Header */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    completedSteps.includes(step.id)
                      ? "bg-green-500 border-green-500 text-white"
                      : step.id === currentStep
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <span
                  className={`ml-3 text-sm font-medium ${
                    step.id === currentStep
                      ? "text-teal-600"
                      : completedSteps.includes(step.id)
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-200 mx-4 min-w-[100px]">
                    <div
                      className={`h-full transition-colors ${
                        completedSteps.includes(step.id)
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Progress
            value={(currentStep / STEPS.length) * 100}
            className="h-2"
          />
        </Card>

        {/* Form Content */}
        <Card className="p-8">
          {createUserError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                <strong>Error creating user:</strong> {createUserError}
              </p>
            </div>
          )}

          {CurrentStepComponent && <CurrentStepComponent />}

          {/* Navigation Buttons */}
          <div className="flex justify-end mt-8 pt-6 border-t">
            {currentStep === STEPS.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isCreatingUser}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                {isCreatingUser ? "Creating User..." : "Next"}
              </Button>
            )}
          </div>
        </Card>

        {/* OTP Verification Dialog */}
        <OtpVerificationDialog
          isOpen={showOtpDialog}
          onClose={handleCloseOtpDialog}
          onVerificationComplete={handleOtpVerificationSuccess}
          phone={personalDetailsForm.watch("contactNumber") || ""}
          email={personalDetailsForm.watch("email") || ""}
          onResendEmailOtp={resendEmailOtp}
          onResendPhoneOtp={resendPhoneOtp}
          canResend={canResendOtp}
          isLimitReached={isLimitReached()}
          countdown={countdown}
        />

        {/* Login Dialog for Existing Users */}
        {existingUserData && (
          <LoginDialog
            isOpen={showLoginDialog}
            onClose={handleCloseLoginDialog}
            onLoginSuccess={handleLoginSuccess}
            userData={existingUserData}
          />
        )}
      </div>
    </div>
  );
}

export default function ReviewForm() {
  return (
    <FormProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ReviewFormContent />
      </Suspense>
    </FormProvider>
  );
}
