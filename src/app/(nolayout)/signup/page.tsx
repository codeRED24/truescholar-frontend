"use client";
import Image from "next/image";
import { useState, Suspense } from "react";
import { Star } from "lucide-react";
import { SignupForm } from "@/components/forms/SignupForm";
import { useSearchParams } from "next/navigation";

function SignupFormWrapper({
  onStepChange,
}: {
  onStepChange?: (step: "signup" | "verify") => void;
}) {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  return (
    <SignupForm
      onStepChange={onStepChange}
      returnUrl={returnUrl || undefined}
    />
  );
}

function LoginLink() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  return (
    <div className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600">
      <p>
        Been here before, eh? Skip the formalities and{" "}
        <a
          href={
            returnUrl
              ? `/signin?returnUrl=${encodeURIComponent(returnUrl)}`
              : "/signin"
          }
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Log in
        </a>{" "}
        like a pro!
      </p>
    </div>
  );
}

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<"signup" | "verify">("signup");

  const handleStepChange = (step: "signup" | "verify") => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Image and Content */}
        <div className="w-full hidden lg:w-7/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative lg:fixed lg:left-0 lg:top-0 lg:h-screen ">
          <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>

          {currentStep === "signup" ? (
            // Signup Step UI
            <>
              {/* Logo */}
              <div className="absolute top-10 left-10">
                <div className="flex flex-row items-center gap-2">
                  <div className="flex flex-col text-right">
                    <span className="text-orange-400 text-xl font-bold">
                      READY
                    </span>
                    <span className="text-blue-300 text-xl font-bold">SET</span>
                  </div>
                  <span className="text-white text-8xl font-bold">SIGN UP</span>
                </div>
              </div>
              {/* 3D Characters */}
              <div className="absolute bottom-0 -right-4 sm:-right-6 md:-right-8 lg:-right-5 xl:-right-10 w-64 h-[420px] sm:w-72 sm:h-[480px] md:w-80 md:h-[520px] lg:w-[400px] lg:h-[600px] xl:w-[500px] xl:h-[750px] z-10">
                <Image
                  src="/_0005.png"
                  alt="Students"
                  priority
                  fetchPriority="high"
                  width={700}
                  height={1000}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute bottom-0 -right-24 sm:-right-28 md:-right-32 lg:-right-28 xl:-right-36 w-64 h-[420px] sm:w-72 sm:h-[480px] md:w-80 md:h-[520px] lg:w-[400px] lg:h-[600px] xl:w-[500px] xl:h-[750px] z-10 pointer-events-none">
                <Image
                  src="/_0028.png"
                  alt="Students"
                  priority
                  fetchPriority="high"
                  width={700}
                  height={1000}
                  className="w-full h-full object-contain"
                />
              </div>
            </>
          ) : (
            // Verification Step UI
            <>
              {/* Lock Image */}
              <Image
                src="/lock.png"
                alt="lock"
                priority
                fetchPriority="high"
                fill
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain z-10 absolute rotate-[15deg] opacity-10"
              />
              <div className="absolute -bottom-10 -right-10 w-80 h-[520px] md:w-[400px] md:h-[600px] lg:w-[400px] lg:h-[650px] xl:w-[531px] xl:h-[861px] z-10">
                <Image
                  src="/_0013.png"
                  alt="Students"
                  priority
                  fetchPriority="high"
                  width={531}
                  height={861}
                  className="w-full h-full object-contain z-30"
                />
              </div>
            </>
          )}

          {/* Daily Dash Feature - Common for both steps */}
          <div className="absolute bottom-8 left-8 z-20 flex flex-col items-center">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg  w-full max-w-md border border-white/20">
              <Image
                src="/gift.gif"
                alt="Gift"
                width={40}
                height={40}
                className="w-20 h-20 md:w-20 md:h-20 object-contain absolute -left-5 z-[1000]"
              />
              <h3 className="text-white font-bold text-base md:text-lg pl-14">
                Introducing Our Daily Dash Feature!
              </h3>
            </div>
            <div className="bg-white/10 w-[96%]  rounded-lg p-4 md:p-6  max-w-md border-l border-r border-b rounded-t-none border-white/20 ">
              <div className="space-y-3 text-white/90 text-xs md:text-sm">
                <div className="flex items-start gap-2">
                  <Star
                    fill="currentColor"
                    className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  />
                  <p>
                    <strong>Maintain Your Daily Dash:</strong> Engage every day
                    and make your Daily Dash – it's like a daily mission for
                    awesome rewards!
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Star
                    fill="currentColor"
                    className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  />
                  <p>
                    <strong>Level Up:</strong> Keep the Daily Dash alive to
                    level up and unlock cool prizes. Reach milestones like 100
                    days, 200 days, and beyond for extra bonuses!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-5/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center min-h-screen lg:py-16 xl:py-20 lg:ml-auto lg:overflow-y-auto lg:h-screen">
          <div className="h-full">
            <div className="text-center mb-6 md:mb-8">
              {currentStep === "signup" ? (
                <>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    <span className="text-blue-600">GET</span>{" "}
                    <span className="text-orange-500">STARTED</span>
                  </h2>
                  <p className="text-gray-600 text-xs md:text-sm">
                    Begin your college journey now! Sign up to explore options
                  </p>
                </>
              ) : (
                <></>
              )}
            </div>

            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  Loading...
                </div>
              }
            >
              <SignupFormWrapper onStepChange={handleStepChange} />
            </Suspense>

            {/* Login Link - Only show on signup step */}
            {currentStep === "signup" && (
              <Suspense fallback={null}>
                <LoginLink />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
