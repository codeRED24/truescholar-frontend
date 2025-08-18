"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonalDetailsStep } from "@/components/form-steps/personal-details-step";
import { StudentReviewStep } from "@/components/form-steps/student-review-step";
import { ProfileVerificationStep } from "@/components/form-steps/profile-verification-step";
import { SuccessScreen } from "@/components/success-screen";
import { FormProvider, useFormContext } from "@/components/form-provider";
import { OtpVerificationDialog } from "@/components/otp-verification-dialog";
import { CheckCircle, Circle } from "lucide-react";
import { useCreateUser } from "@/lib/hooks/useCreateUser";
import { CreateUserRequest } from "@/api/users/createUser";

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
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  const {
    createUserAsync,
    isLoading: isCreatingUser,
    error: createUserError,
  } = useCreateUser();

  const {
    validateCurrentStep,
    validatePersonalDetailsWithOtp,
    studentReviewForm,
    profileVerificationForm,
    personalDetailsForm,
  } = useFormContext();

  const handleNext = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (isValid) {
      if (currentStep === 1) {
        // Console log all fields from step 1 (Personal Details) before asking for OTPs
        const step1Data = personalDetailsForm.getValues();
        // console.log("\n=== STEP 1 DATA BEFORE OTP VERIFICATION ===");
        // console.log("Name:", step1Data.name);
        // console.log("Email:", step1Data.email);
        // console.log("Gender:", step1Data.gender);
        // console.log("Contact Number:", step1Data.contactNumber);
        // console.log("Country Code:", step1Data.countryCode);
        // console.log("Country of Origin:", step1Data.countryOfOrigin);
        // console.log("College Name:", step1Data.collegeName);
        // console.log("College Location:", step1Data.collegeLocation);
        // console.log("Course Name:", step1Data.courseName);
        // console.log("Graduation Year:", step1Data.graduationYear);
        // console.log("UPI ID:", step1Data.upiId);
        // console.log("Email Verified:", step1Data.isEmailVerified);
        // console.log("Phone Verified:", step1Data.isPhoneVerified);
        // console.log("Collegeid:", step1Data.collegeId);
        // console.log("CourseId:", step1Data.courseId);

        // console.log("=== END STEP 1 DATA ===\n");

        // Create user via API call
        try {
          const userPayload: CreateUserRequest = {
            name: step1Data.name,
            email: step1Data.email,
            gender: step1Data.gender,
            contact_number: step1Data.contactNumber,
            country_of_origin: step1Data.countryOfOrigin,
            college_id: step1Data.collegeId,
            course_id: step1Data.courseId,
            college_location: step1Data.collegeLocation,
            pass_year: step1Data.graduationYear,
            user_type: "student", // Default user type for review form
          };

          // console.log("Creating user with payload:", userPayload);
          const userResponse = await createUserAsync(userPayload);
          // console.log("User created successfully:", userResponse);
          setCreatedUserId(userResponse.data.id);
        } catch (error) {
          console.error("Failed to create user:", error);
          // You might want to show an error message to the user here
          // alert("Failed to create user. Please try again.");
          return; // Don't proceed to OTP if user creation fails
        }

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

  const handlePrevious = () => {
    // going back removed: no-op
  };

  const handleStepClick = async (stepId: number) => {
    // Disable going back via step clicks. Allow only advancing to the next step
    // when clicking the immediate next step after validation.
    if (stepId === currentStep + 1) {
      const isValid = await validateCurrentStep(currentStep);
      if (isValid) {
        if (currentStep === 1) {
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

    setIsSubmitting(true);

    // Get data from steps 2 and 3
    const step2Data = studentReviewForm.getValues();
    const step3Data = profileVerificationForm.getValues();

    // Combined data for API submission
    const combinedFormData = {
      ...step2Data,
      ...step3Data,
      submittedAt: new Date().toISOString(),
    };

    // console.log("\n=== COMBINED FORM DATA FOR API ===");
    // console.log(combinedFormData);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Here you would typically send the form data to your backend
    // const response = await submitReview(combinedFormData)
    // console.log("Form submitted successfully!");

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
  };

  if (isSubmitted) {
    return <SuccessScreen onReset={handleReset} />;
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
          onSuccess={handleOtpVerificationSuccess}
          phoneNumber={personalDetailsForm.watch("contactNumber") || ""}
          email={personalDetailsForm.watch("email") || ""}
          countryCode={personalDetailsForm.watch("countryCode") || "IN (+91)"}
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
