"use client";

import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SuccessScreen } from "@/components/success-screen";
import { ReviewFormProvider } from "@/components/review-form/form-provider";
import { useReviewWizard } from "@/components/review-form/use-review-wizard";
import { PersonalDetailsStep } from "@/components/review-form/steps/personal-details";
import { AcademicStep } from "@/components/review-form/steps/academic-step";
import { FeedbackStep } from "@/components/review-form/steps/feedback-step";
import { VerificationStep } from "@/components/review-form/steps/verification-step";
import { CheckCircle, Circle, Gift, Loader2 } from "lucide-react";

// Step configuration
const STEPS = [
  { id: 1, title: "Personal Details", component: PersonalDetailsStep },
  { id: 2, title: "Academic Information", component: AcademicStep },
  { id: 3, title: "Feedback", component: FeedbackStep },
];

function ReviewFormContent() {
  const wizard = useReviewWizard();

  // Loading state
  if (wizard.isSessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Success state
  if (wizard.isSubmitted) {
    return (
      <SuccessScreen
        onReset={wizard.handleReset}
        referralCode={wizard.referralCode}
      />
    );
  }

  // Get current step component
  const CurrentStep = STEPS.find((s) => s.id === wizard.currentStep)?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Referral Banner */}
        {wizard.referredByCode && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-green-50 border-teal-200">
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="font-semibold text-teal-800">Welcome! 🎉</h3>
                <p className="text-sm text-teal-700">
                  Referred by:{" "}
                  <code className="bg-teal-100 px-2 py-1 rounded text-teal-900 font-mono">
                    {wizard.referredByCode}
                  </code>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Stepper */}
        <Card className="mb-8 p-4 md:p-6">
          <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, index) => {
              const isCompleted =
                wizard.completedSteps.includes(step.id) ||
                (wizard.isAuthenticated && step.id === 1);
              const isCurrent = step.id === wizard.currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => wizard.handleStepClick(step.id)}
                    disabled={wizard.isAuthenticated && step.id === 1}
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <Circle className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                  </button>
                  <span
                    className={`ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${
                      isCurrent
                        ? "text-teal-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className="h-0.5 bg-gray-200 mx-2 sm:mx-4 min-w-[20px] sm:min-w-[50px] md:min-w-[100px]">
                      <div
                        className={`h-full ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Form Content */}
        <Card className="p-8">
          {wizard.showVerification ? (
            <VerificationStep
              email={wizard.verificationEmail}
              phone={wizard.verificationPhone}
              needsEmailVerification={wizard.needsEmailVerification}
              needsPhoneVerification={wizard.needsPhoneVerification}
              onVerificationComplete={wizard.handleVerificationComplete}
            />
          ) : (
            <>
              {CurrentStep && <CurrentStep />}

              {/* Navigation */}
              <div className="flex justify-end mt-8 pt-6 border-t">
                {wizard.isLastStep ? (
                  <Button
                    onClick={wizard.handleSubmit}
                    disabled={wizard.isLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    {wizard.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={wizard.goToNextStep}
                    disabled={wizard.isLoading}
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    {wizard.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {wizard.isCreatingUser
                          ? "Creating Account..."
                          : "Processing..."}
                      </>
                    ) : (
                      "Next"
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ReviewFormPage() {
  return (
    <ReviewFormProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        }
      >
        <ReviewFormContent />
      </Suspense>
    </ReviewFormProvider>
  );
}
