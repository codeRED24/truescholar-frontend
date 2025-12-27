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
  CheckCircle2,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { emailOTP, phoneNumber } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface VerificationStepProps {
  email: string;
  phone: string;
  needsEmailVerification: boolean;
  needsPhoneVerification: boolean;
  onVerificationComplete: () => void;
}

type VerificationPhase = "email" | "phone" | "complete";

export function VerificationStep({
  email,
  phone,
  needsEmailVerification,
  needsPhoneVerification,
  onVerificationComplete,
}: VerificationStepProps) {
  // Determine starting phase
  const getInitialPhase = (): VerificationPhase => {
    if (needsEmailVerification) return "email";
    if (needsPhoneVerification) return "phone";
    return "complete";
  };

  const [currentPhase, setCurrentPhase] =
    useState<VerificationPhase>(getInitialPhase);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(!needsEmailVerification);
  const [phoneVerified, setPhoneVerified] = useState(!needsPhoneVerification);
  const [emailTimer, setEmailTimer] = useState(0);
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [otpSentCount, setOtpSentCount] = useState(0);

  const hasSentInitialOtps = useRef(false);

  // Send initial OTPs on mount
  useEffect(() => {
    if (!hasSentInitialOtps.current) {
      hasSentInitialOtps.current = true;
      sendInitialOtps();
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (emailTimer > 0 || phoneTimer > 0) {
      const timer = setTimeout(() => {
        setEmailTimer((prev) => Math.max(0, prev - 1));
        setPhoneTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailTimer, phoneTimer]);

  // Check if verification is complete
  useEffect(() => {
    if (emailVerified && phoneVerified) {
      setCurrentPhase("complete");
      const timer = setTimeout(() => {
        onVerificationComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [emailVerified, phoneVerified, onVerificationComplete]);

  const handleRateLimit = (error: any) => {
    if (
      error?.status === 429 ||
      error?.message?.includes("Too many requests") ||
      error?.code === "TOO_MANY_REQUESTS"
    ) {
      toast.error(
        "Too many attempts. Please wait 60 seconds before trying again."
      );
      // Force a 60s cooldown on the relevant timer
      if (
        currentPhase === "email" ||
        (needsEmailVerification && !emailVerified)
      ) {
        setEmailTimer(60);
      }
      if (
        currentPhase === "phone" ||
        (needsPhoneVerification && !phoneVerified)
      ) {
        setPhoneTimer(60);
      }
    } else {
      toast.error(error?.message || "Failed to send code. Please try again.");
    }
  };

  const sendInitialOtps = async () => {
    try {
      setIsResending(true);

      // Send email OTP if needed
      if (needsEmailVerification && email && !emailVerified) {
        const emailResult = await emailOTP.sendVerificationOtp({
          email,
          type: "email-verification",
        });
        if (emailResult.error) {
          console.error("Failed to send email OTP:", emailResult.error);
          handleRateLimit(emailResult.error);
        } else {
          setEmailTimer(30);
        }
      }

      // Send phone OTP if needed AND email is already verified
      // (Sequential flow as requested)
      if (needsPhoneVerification && phone && emailVerified) {
        const phoneResult = await phoneNumber.sendOtp({
          phoneNumber: phone,
        });
        if (phoneResult.error) {
          console.error("Failed to send phone OTP:", phoneResult.error);
          handleRateLimit(phoneResult.error);
        } else {
          setPhoneTimer(30);
        }
      }

      setOtpSentCount((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to send OTPs:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleResend = async () => {
    if (isResending || otpSentCount >= 5) return;
    const timer = currentPhase === "email" ? emailTimer : phoneTimer;
    if (timer > 0) return;

    try {
      setIsResending(true);

      if (currentPhase === "email") {
        const result = await emailOTP.sendVerificationOtp({
          email,
          type: "email-verification",
        });
        if (result.error) {
          handleRateLimit(result.error);
        } else {
          setEmailTimer(30);
          toast.success("Email verification code sent");
        }
      } else if (currentPhase === "phone") {
        const result = await phoneNumber.sendOtp({ phoneNumber: phone });
        if (result.error) {
          handleRateLimit(result.error);
        } else {
          setPhoneTimer(30);
          toast.success("Phone verification code sent");
        }
      }
      setOtpSentCount((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to resend code"); // Network/Unexpected error
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setIsVerifying(true);

      if (currentPhase === "email") {
        const result = await emailOTP.verifyEmail({ email, otp });
        if (result.error) {
          toast.error(result.error.message || "Invalid code");
          return;
        }
        setEmailVerified(true);
        setOtp("");
        if (needsPhoneVerification && !phoneVerified) {
          setCurrentPhase("phone");
          // Trigger phone OTP now that email is verified
          setIsResending(true);
          try {
            const phoneResult = await phoneNumber.sendOtp({
              phoneNumber: phone,
            });
            if (phoneResult.error) {
              handleRateLimit(phoneResult.error);
            } else {
              setPhoneTimer(30);
              toast.success("Phone verification code sent");
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsResending(false);
          }
        }
      } else if (currentPhase === "phone") {
        const result = await phoneNumber.verify({
          phoneNumber: phone,
          code: otp,
        });
        if (result.error) {
          toast.error(result.error.message || "Invalid code");
          return;
        }
        setPhoneVerified(true);
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const getCurrentTimer = () =>
    currentPhase === "email" ? emailTimer : phoneTimer;
  const getCurrentTarget = () => (currentPhase === "email" ? email : phone);
  const isLimitReached = otpSentCount >= 5;

  return (
    <div className="max-w-md mx-auto py-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verify{" "}
          {currentPhase === "email"
            ? "Email Address"
            : currentPhase === "phone"
            ? "Phone Number"
            : "Identity"}
        </h2>
        <p className="text-gray-500 text-sm">
          {currentPhase === "complete"
            ? "Thank you! verification completed successfully."
            : "To secure your account, please verify your contact details."}
        </p>
      </div>

      {/* Steps Indicator - Minimal */}
      <div className="flex items-center justify-center gap-2 mb-8 text-sm">
        {needsEmailVerification && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
              emailVerified
                ? "text-green-600 bg-green-50"
                : currentPhase === "email"
                ? "text-gray-900 bg-gray-100 font-medium"
                : "text-gray-400"
            )}
          >
            {emailVerified ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span>Email</span>
          </div>
        )}

        {needsEmailVerification && needsPhoneVerification && (
          <div className="w-4 h-[1px] bg-gray-200" />
        )}

        {needsPhoneVerification && (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
              phoneVerified
                ? "text-green-600 bg-green-50"
                : currentPhase === "phone"
                ? "text-gray-900 bg-gray-100 font-medium"
                : "text-gray-400"
            )}
          >
            {phoneVerified ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            <span>Phone</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      {currentPhase !== "complete" ? (
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <Label className="text-sm font-medium text-gray-700">
              Enter 6-digit code sent to
            </Label>
            <div className="font-medium text-gray-900">
              {getCurrentTarget()}
            </div>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-10 h-10 sm:w-12 sm:h-12 border-gray-200 focus:border-teal-500 text-lg"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {isLimitReached
                ? "Maximum attempts reached"
                : "Didn't receive code?"}
            </span>
            <button
              onClick={handleResend}
              disabled={isResending || getCurrentTimer() > 0 || isLimitReached}
              className="font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isResending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : getCurrentTimer() > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Resend in {getCurrentTimer()}s</span>
                </>
              ) : (
                "Resend"
              )}
            </button>
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="w-full bg-teal-600 hover:bg-teal-700 h-11"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify {currentPhase === "email" ? "Email" : "Phone"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 text-lg">
              You're all set!
            </h3>
            <p className="text-gray-500">Redirecting to the next step...</p>
          </div>
        </div>
      )}
    </div>
  );
}
