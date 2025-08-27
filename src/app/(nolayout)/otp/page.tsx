"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/stores/signupStore";
import { useUserStore } from "@/stores/userStore";
import useOtpApi from "@/hooks/use-otp";

export default function VerifyPage() {
  const [phoneOtp, setPhoneOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [emailOtp, setEmailOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  const {
    signupData,
    clearSignupData,
    otpState,
    setOtpSent,
    updateOtpTimers,
    canSendOtp,
  } = useSignupStore();
  const { login } = useUserStore();

  const {
    loading: otpLoading,
    error: otpError,
    sendEmailOtp,
    sendPhoneOtp,
    verifyEmailOtp,
    verifyPhoneOtp,
  } = useOtpApi();

  // Redirect if no signup data
  useEffect(() => {
    if (!signupData) {
      router.push("/signup");
    }
  }, [signupData, router]);

  // Send OTPs when component mounts (if signup data exists and OTPs haven't been sent)
  useEffect(() => {
    if (signupData && !otpState.hasSentOtps) {
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

  const sendInitialOtps = async () => {
    if (!signupData || !signupData.email || !signupData.contactNumber) {
      console.error("Missing signup data for sending OTPs");
      return;
    }

    if (!canSendOtp()) {
      console.log("Cannot send OTPs due to rate limiting");
      return;
    }

    try {
      setIsResending(true);
      await Promise.all([
        sendEmailOtp(signupData.email),
        sendPhoneOtp(signupData.contactNumber),
      ]);
      setOtpSent(30, 30); // Set 30 second timers for both email and phone
      toast.success("OTPs sent to your email and phone!");
    } catch (error) {
      console.error("Failed to send initial OTPs:", error);
      toast.error("Failed to send OTPs. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleResendPhone = async () => {
    if (
      !signupData ||
      !signupData.contactNumber ||
      isResending ||
      otpState.phoneTimer > 0
    )
      return;

    if (!canSendOtp()) {
      toast.error("Too many OTP requests. Please wait before trying again.");
      return;
    }

    try {
      setIsResending(true);
      await sendPhoneOtp(signupData.contactNumber);
      setOtpSent(otpState.emailTimer, 30); // Keep email timer, reset phone timer
      toast.success("OTP resent to your phone!");
    } catch (error) {
      console.error("Failed to resend phone OTP:", error);
      toast.error("Failed to resend phone OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleResendEmail = async () => {
    if (
      !signupData ||
      !signupData.email ||
      isResending ||
      otpState.emailTimer > 0
    )
      return;

    if (!canSendOtp()) {
      toast.error("Too many OTP requests. Please wait before trying again.");
      return;
    }

    try {
      setIsResending(true);
      await sendEmailOtp(signupData.email);
      setOtpSent(30, otpState.phoneTimer); // Reset email timer, keep phone timer
      toast.success("OTP resent to your email!");
    } catch (error) {
      console.error("Failed to resend email OTP:", error);
      toast.error("Failed to resend email OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangePhone = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`phone-otp-${index + 1}`)?.focus();
    }
  };

  const handleChangeEmail = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`email-otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupData || !signupData.email || !signupData.contactNumber) {
      toast.error("Session expired. Please sign up again.");
      router.push("/signup");
      return;
    }

    const phoneCode = phoneOtp.join("");
    const emailCode = emailOtp.join("");

    if (phoneCode.length !== 6 || emailCode.length !== 6) {
      toast.error(
        "Please enter complete 6-digit OTPs for both email and phone."
      );
      return;
    }

    try {
      setIsResending(true);

      // Verify both OTPs
      await Promise.all([
        verifyEmailOtp(signupData.email, emailCode),
        verifyPhoneOtp(signupData.contactNumber, phoneCode),
      ]);

      // Create user object and login
      const user = {
        id: Date.now().toString(), // In real app, this would come from backend
        name: signupData.name || signupData.email.split("@")[0], // Use name from signup data or email
        email: signupData.email,
        role: "student" as const,
      };

      login(user);
      clearSignupData();

      toast.success("✅ Verification successful! Welcome aboard!");
      router.push("/dashboard"); // Redirect after success
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("❌ Invalid OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isLimitReached = () => {
    return otpState.otpSentCount >= 5;
  };

  if (!signupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image & Character */}
      <div className="w-full lg:w-2/3 relative overflow-hidden lg:flex items-center justify-center p-4 md:p-8 hidden">
        <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>

        {/* Daily Dash Feature Card */}
        <div className="absolute bottom-10 left-10 z-20 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg max-w-xs mx-auto mt-10">
          <div className="flex items-center gap-2 mb-3">
            <img
              src="https://i.imgur.com/rFfRtQV.png"
              alt="Gift"
              className="w-8 h-8"
            />
            <h3 className="text-white font-bold text-sm">
              Introducing Our Daily Dash Feature!
            </h3>
          </div>
          <ul className="text-white/90 text-xs space-y-2">
            <li className="flex items-start gap-1">
              <span className="text-yellow-400">🔥</span>
              <span>
                <strong>Maintain Your Daily Dash:</strong> Engage every day and
                make your Daily Dash – it's like a daily mission for awesome
                rewards!
              </span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-yellow-400">🏆</span>
              <span>
                <strong>Level Up:</strong> Keep the Daily Dash alive to level up
                and unlock cool prizes. Reach milestones like 100 days, 200
                days, and beyond for extra bonuses!
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/3 bg-white p-6 md:p-8 flex flex-col justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <span className="text-blue-600">VERIFY</span>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </h1>
          <p className="text-gray-600 text-sm">
            Validate your email and phone number
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone OTP */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Enter the OTP sent on{" "}
              <span className="font-semibold">{signupData.contactNumber}</span>
            </Label>
            <div className="flex gap-2">
              {phoneOtp.map((digit, index) => (
                <Input
                  key={`phone-${index}`}
                  id={`phone-otp-${index}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangePhone(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendPhone}
                disabled={
                  isResending ||
                  otpState.phoneTimer > 0 ||
                  otpLoading ||
                  isLimitReached()
                }
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {isResending || otpLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : otpState.phoneTimer > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Resend in {otpState.phoneTimer}s
                  </>
                ) : isLimitReached() ? (
                  "Limit reached"
                ) : (
                  "Resend OTP"
                )}
              </button>
            </div>
          </div>

          {/* Email OTP */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Enter the OTP sent on{" "}
              <span className="font-semibold">{signupData.email}</span>
            </Label>
            <div className="flex gap-2">
              {emailOtp.map((digit, index) => (
                <Input
                  key={`email-${index}`}
                  id={`email-otp-${index}`}
                  type="tel"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChangeEmail(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg border-gray-300 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={
                  isResending ||
                  otpState.emailTimer > 0 ||
                  otpLoading ||
                  isLimitReached()
                }
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                {isResending || otpLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : otpState.emailTimer > 0 ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Resend in {otpState.emailTimer}s
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
            type="submit"
            disabled={isResending || otpLoading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isResending || otpLoading ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </div>
            ) : (
              "Verify"
            )}
          </Button>
        </form>

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
