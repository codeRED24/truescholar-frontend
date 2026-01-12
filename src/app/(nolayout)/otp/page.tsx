"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  CheckCircle,
  RefreshCw,
  Clock,
  Loader,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { emailOTP, phoneNumber, getSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";

type VerificationStep = "email" | "phone" | "complete";

export default function VerifyPage() {
  const [currentStep, setCurrentStep] = useState<VerificationStep>("email");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const router = useRouter();

  // Ref to prevent double-send in React StrictMode
  const hasSentOtpsRef = useRef(false);

  const {
    signupData,
    clearSignupData,
    otpState,
    setOtpSent,
    updateOtpTimers,
    canSendOtp,
  } = useSignupStore();

  // Redirect if no signup data
  useEffect(() => {
    if (!signupData) {
      router.push("/signup");
    }
  }, [signupData, router]);

  // Send OTPs when component mounts
  useEffect(() => {
    if (signupData && !otpState.hasSentOtps && !hasSentOtpsRef.current) {
      hasSentOtpsRef.current = true;
      sendInitialOtps();
    }
  }, [signupData, otpState.hasSentOtps]);

  // Timer countdown effect
  useEffect(() => {
    if (otpState.emailTimer > 0 || otpState.phoneTimer > 0) {
      const timer = setTimeout(() => {
        updateOtpTimers(
          Math.max(0, otpState.emailTimer - 1),
          Math.max(0, otpState.phoneTimer - 1)
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpState.emailTimer, otpState.phoneTimer, updateOtpTimers]);

  // Send both OTPs on mount
  const sendInitialOtps = async () => {
    if (!signupData || !signupData.email || !signupData.phoneNumber) {
      console.error("Missing signup data for sending OTPs");
      return;
    }

    if (!canSendOtp()) {
      console.log("Cannot send OTPs due to rate limiting");
      return;
    }

    try {
      setIsResending(true);

      // Send email OTP first
      const emailResult = await emailOTP.sendVerificationOtp({
        email: signupData.email,
        type: "email-verification",
      });
      if (emailResult.error) {
        console.error("Failed to send email OTP:", emailResult.error);
      }

      // Send phone OTP
      const phoneResult = await phoneNumber.sendOtp({
        phoneNumber: signupData.phoneNumber,
      });
      if (phoneResult.error) {
        console.error("Failed to send phone OTP:", phoneResult.error);
      }

      setOtpSent(30, 30);
      toast.success("OTPs sent to your email and phone!");
    } catch (error) {
      console.error("Failed to send OTPs:", error);
      toast.error("Failed to send OTPs. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleResend = async () => {
    if (!signupData || isResending) return;

    const timer =
      currentStep === "email" ? otpState.emailTimer : otpState.phoneTimer;
    if (timer > 0) return;

    if (!canSendOtp()) {
      toast.error("Too many OTP requests. Please wait before trying again.");
      return;
    }

    try {
      setIsResending(true);

      if (currentStep === "email") {
        await emailOTP.sendVerificationOtp({
          email: signupData.email,
          type: "email-verification",
        });
        setOtpSent(30, otpState.phoneTimer);
        toast.success("OTP resent to your email!");
      } else {
        await phoneNumber.sendOtp({
          phoneNumber: signupData.phoneNumber,
        });
        setOtpSent(otpState.emailTimer, 30);
        toast.success("OTP resent to your phone!");
      }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!signupData || otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setIsVerifying(true);

      if (currentStep === "email") {
        // Verify email OTP
        const result = await emailOTP.verifyEmail({
          email: signupData.email,
          otp: otp,
        });

        if (result.error) {
          toast.error(result.error.message || "Invalid email OTP");
          setIsVerifying(false);
          return;
        }

        // Email verified! Move to phone step
        setEmailVerified(true);
        setOtp("");
        setCurrentStep("phone");
        toast.success("Email verified! Now verify your phone.");
      } else if (currentStep === "phone") {
        // Verify phone OTP
        const result = await phoneNumber.verify({
          phoneNumber: signupData.phoneNumber,
          code: otp,
        });

        if (result.error) {
          toast.error(result.error.message || "Invalid phone OTP");
          setIsVerifying(false);
          return;
        }

        // Phone verified! Complete the flow
        setPhoneVerified(true);
        setCurrentStep("complete");

        // Get session and redirect
        const session = await getSession();
        clearSignupData();

        if (session.data) {
          toast.success("Verification complete! Welcome aboard!");
          router.push("/");
        } else {
          toast.success("Verification complete! Please sign in.");
          router.push("/signin");
        }
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getCurrentTimer = () => {
    return currentStep === "email" ? otpState.emailTimer : otpState.phoneTimer;
  };

  const getCurrentTarget = () => {
    if (!signupData) return "";
    return currentStep === "email" ? signupData.email : signupData.phoneNumber;
  };

  const isLimitReached = () => {
    return otpState.otpSentCount >= 5;
  };

  if (!signupData) {
    return (
      <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-gray-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image & Character */}
      <div className="w-full lg:w-7/12 relative overflow-y-clip lg:flex items-center justify-center p-4 md:p-8 hidden">
        <div className="inset-0 absolute bg-linear-to-b from-[#142D55] to-[#4777C4]"></div>
        <Image
          src="/lock.png"
          alt="lock"
          priority
          fetchPriority="high"
          fill
          className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain z-10 absolute rotate-15 opacity-10"
        />

        {/* Daily Dash Feature Card */}
        <div className="absolute bottom-8 left-8 z-20 flex flex-col items-center">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-lg w-full max-w-md border border-white/20">
            <Image
              src="/gift.gif"
              alt="Gift"
              width={40}
              height={40}
              className="w-20 h-20 md:w-20 md:h-20 object-contain absolute -left-5 z-1000"
            />
            <h3 className="text-white font-bold text-base md:text-lg pl-14">
              Introducing Our Daily Dash Feature!
            </h3>
          </div>
          <div className="bg-white/10 w-[96%] rounded-lg p-4 md:p-6 max-w-md border-l border-r border-b rounded-t-none border-white/20">
            <div className="space-y-3 text-white/90 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <Star
                  fill="currentColor"
                  className="w-4 h-4 text-yellow-400 mt-1 shrink-0"
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
                  className="w-4 h-4 text-yellow-400 mt-1 shrink-0"
                />
                <p>
                  <strong>Level Up:</strong> Keep the Daily Dash alive to level
                  up and unlock cool prizes. Reach milestones like 100 days, 200
                  days, and beyond for extra bonuses!
                </p>
              </div>
            </div>
          </div>
        </div>

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
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-5/12 bg-white p-6 md:p-8 flex flex-col justify-center">
        <Link href={"/"} className="text-3xl text-center mb-4 font-extrabold">
          True
          <span className="text-primary-main">Scholar</span>
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span className="text-blue-600">VERIFY</span>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </h1>
          <p className="text-gray-600 text-sm">
            Validate your email and phone number
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Email Step */}
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                emailVerified
                  ? "bg-green-500 text-white"
                  : currentStep === "email"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {emailVerified ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                emailVerified
                  ? "text-green-600"
                  : currentStep === "email"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Email
            </span>
          </div>

          {/* Connector */}
          <div
            className={`w-12 h-1 rounded ${
              emailVerified ? "bg-green-500" : "bg-gray-200"
            }`}
          />

          {/* Phone Step */}
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                phoneVerified
                  ? "bg-green-500 text-white"
                  : currentStep === "phone"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {phoneVerified ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                phoneVerified
                  ? "text-green-600"
                  : currentStep === "phone"
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Phone
            </span>
          </div>
        </div>

        {/* OTP Input Form */}
        {currentStep !== "complete" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-gray-700">
                Enter the OTP sent to{" "}
                <span className="font-semibold text-blue-600">
                  {getCurrentTarget()}
                </span>
              </Label>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <p>Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    isResending || getCurrentTimer() > 0 || isLimitReached()
                  }
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : getCurrentTimer() > 0 ? (
                    <>
                      <Clock className="w-4 h-4" />
                      Resend in {getCurrentTimer()}s
                    </>
                  ) : isLimitReached() ? (
                    "Limit reached"
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || otp.length !== 6}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </div>
              ) : (
                `Verify ${currentStep === "email" ? "Email" : "Phone"}`
              )}
            </Button>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            onClick={() => router.push("/signup")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
