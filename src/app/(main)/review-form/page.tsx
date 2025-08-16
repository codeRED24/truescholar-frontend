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
import { CheckCircle, Circle } from "lucide-react";

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
  const { validateCurrentStep, studentReviewForm, profileVerificationForm } =
    useFormContext();

  const handleNext = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCompletedSteps((prev) => [
        ...prev.filter((s) => s !== currentStep),
        currentStep,
      ]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = async (stepId: number) => {
    if (stepId < currentStep || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    } else if (stepId === currentStep + 1) {
      const isValid = await validateCurrentStep(currentStep);
      if (isValid) {
        setCompletedSteps((prev) => [
          ...prev.filter((s) => s !== currentStep),
          currentStep,
        ]);
        setCurrentStep(stepId);
      }
    }
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

    console.log("\n=== COMBINED FORM DATA FOR API ===");
    console.log(combinedFormData);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Here you would typically send the form data to your backend
    // const response = await submitReview(combinedFormData)
    console.log("Form submitted successfully!");

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setIsSubmitted(false);
    setIsSubmitting(false);
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
          {CurrentStepComponent && <CurrentStepComponent />}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
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
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Next
              </Button>
            )}
          </div>
        </Card>
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
