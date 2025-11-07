import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { RefreshCw, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { verifyEmailOtp, resendEmailOtp } from "@/api/auth/auth";
import { useRouter } from "next/navigation";

interface OtpFormProps {
  signupData: any;
  onVerificationSuccess: () => void;
  onBack: () => void;
  returnUrl?: string;
}

export const OtpForm = ({
  signupData,
  onVerificationSuccess,
  onBack,
  returnUrl,
}: OtpFormProps) => {
  const router = useRouter();
  const [emailOtp, setEmailOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationError, setverificationError] = useState<null | string>(
    null
  );
  const [resendEmailOtpError, setResendEmailOtpError] = useState<null | string>(
    null
  );

  // OTP timer effect
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Auto-verify when 6 digits are entered (using controlled value/onChange)
  useEffect(() => {
    if (emailOtp.length === 6 && !isVerifying) {
      // trigger verification when user completes 6 digits
      // call without awaiting to avoid blocking rendering
      void handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailOtp, isVerifying]);

  const handleVerifyOtp = async () => {
    if (isVerifying) return;

    if (emailOtp.length !== 6) {
      // Handle validation error
      return;
    }

    setIsVerifying(true);
    // clear previous error when starting a new verification attempt
    setverificationError(null);
    try {
      await verifyEmailOtp({
        identifier: signupData.email!,
        otp: emailOtp,
      });

      // Redirect to returnUrl if present, otherwise call success handler
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        onVerificationSuccess();
        router.push("/");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      // ensure we always set a string (React cannot render an Error object)
      setverificationError(
        error instanceof Error ? error.message : String(error)
      );
      setEmailOtp("");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || otpTimer > 0) return;

    setIsResending(true);
    // clear previous resend error when trying again
    setResendEmailOtpError(null);
    try {
      await resendEmailOtp({ identifier: signupData.email! });
      setOtpTimer(60);
      setEmailOtp(""); // Reset OTP input
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      setResendEmailOtpError(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="flex flex-col items-center">
        <h1 className="bg-gradient-to-r text-5xl font-bold via-[#416EB5] from-[#142D55]  to-[#FB6534] inline-block text-transparent bg-clip-text">
          VERIFY
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Check
          <span className="font-medium text-gray-900">
            {" "}
            {signupData.email?.toLowerCase()}{" "}
          </span>
          for the 6-digit verification code.
        </p>
      </div>
      <div className="space-y-6 max-w-md flex items-center justify-center flex-col">
        {/*error message*/}
        {verificationError || resendEmailOtpError ? (
          <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700 mt-1">
                {verificationError || resendEmailOtpError}
              </p>
            </div>
          </div>
        ) : null}

        {/* Email OTP Input */}
        <div className="space-y-4">
          {isVerifying ? "Verifying..." : "Verify Email"}
          <div className="flex justify-center">
            <InputOTP value={emailOtp} onChange={setEmailOtp} maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Resend Section */}
        <div className="text-center">
          <div className="text-sm text-gray-600 flex items-center gap-1">
            Didn't receive the code?
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || otpTimer > 0}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 mx-auto disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : otpTimer > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  Resend in {otpTimer}s
                </>
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        </div>

        {/* Back to Signup */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 underline font-medium text-sm"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
