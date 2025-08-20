"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonalDetailsStep } from "@/components/form-steps/personal-details-step";
import { StudentReviewStep } from "@/components/form-steps/student-review-step";
import { ProfileVerificationStep } from "@/components/form-steps/profile-verification-step";
import { SuccessScreen } from "@/components/success-screen";
import {
  FormProvider,
  useFormContext,
  initialFormData,
} from "@/components/form-provider";
import { OtpVerificationDialog } from "@/components/otp-verification-dialog";
import { CheckCircle, Circle } from "lucide-react";
import { useCreateUser } from "@/hooks/useCreateUser";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { CreateUserRequest } from "@/api/users/createUser";
import useOtpApi from "@/hooks/use-otp";
import { toast } from "sonner";
import { getCurrentLocation } from "@/utils/location";

const OTP_COOLDOWN_SECONDS = 30;

const STEPS = [
  { id: 1, title: "Personal Details", component: PersonalDetailsStep },
  { id: 2, title: "Student Review", component: StudentReviewStep },
  { id: 3, title: "Profile Verification", component: ProfileVerificationStep },
];

function ReviewFormContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);
  const [lastCreatedUserData, setLastCreatedUserData] =
    useState<CreateUserRequest | null>(null);
  const [otpSentCount, setOtpSentCount] = useState(0);
  const [lastOtpSentTime, setLastOtpSentTime] = useState<number | null>(null);
  const [otpsAlreadySent, setOtpsAlreadySent] = useState(false);
  const [canResendOtp, setCanResendOtp] = useState(true);

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
          user_location: userLocation || undefined,
          user_type: "student", // Default user type for review form
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
            return; // Don't proceed to OTP if user creation fails
          }
        } else {
          // console.log("User already created, skipping user creation");
        }

        // Send OTPs if needed before showing dialog
        await sendOtpsIfNeeded();

        // For step 1, show OTP verification dialog after basic validation
        setShowOtpDialog(true);
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

    // Get data from steps 2 and 3
    const step2Data = studentReviewForm.getValues();
    const step3Data = profileVerificationForm.getValues();

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

        // Titles & comments
        reviewTitle: step2Data.collegePlacementTitle,
        collegeAdmissionComment: step2Data.admissionExperienceComment,
        campusExperienceComment: step2Data.campusExperienceComment,
        placementJourneyComment: step2Data.placementJourneyComment,
        academicExperienceComment: step2Data.academicExperienceComment,

        // Ratings mapping (frontend keys differ slightly)
        collegeAdmissionRating: step2Data.collegeAdmissionRating,
        campusExperienceRating: step2Data.campusExperienceRating,
        placementJourneyRating: step2Data.placementJourneyRating,
        academicExperienceRating:
          step2Data.academicQualityRating || step2Data.academicExperienceRating,

        // Images
        collegeImages: step2Data.collegeImages || [],

        // Profile verification fields
        profilePicture: step3Data.profilePicture || null,
        studentId: step3Data.studentId || null,
        markSheet: step3Data.markSheet || null,
        degreeCertificate: step3Data.degreeCertificate || null,
        linkedinProfile: step3Data.linkedinProfile || undefined,
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
      </div>
    </div>
  );
}

export default function ReviewForm() {
  return (
    <FormProvider>
      <ReviewFormContent />
    </FormProvider>
  );
}
