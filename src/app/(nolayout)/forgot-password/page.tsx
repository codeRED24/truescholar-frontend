"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useOtpApi } from "@/hooks/use-otp";
import { useForgotPassword } from "@/hooks/use-forgot-password";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ForgetPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { sendEmailOtp, verifyEmailOtp, loading, error } = useOtpApi();
  const { forgotPassword, loading: passwordLoading } = useForgotPassword();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      await sendEmailOtp(data.email);
      setEmail(data.email);
      setStep("otp");
      otpForm.reset(); // Reset OTP form to ensure it's clean
      toast.success("OTP sent to your email");
    } catch (error) {
      // Error is handled by the hook
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    try {
      // First verify the OTP
      await verifyEmailOtp(email, data.otp);
      setStep("password");
      toast.success("OTP verified successfully");
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const result = await forgotPassword({
        email,
        password: data.newPassword,
      });

      if (result.success || result.message?.toLowerCase().includes("success")) {
        toast.success("Password reset successfully");
        router.push("/signin");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      emailForm.reset();
      otpForm.reset();
    } else if (step === "password") {
      setStep("otp");
      passwordForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
        {/* Left Side - Image and Content */}
        <div className="w-full hidden lg:w-8/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
          <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>
          {/* Logo */}
          <div className="absolute top-10 left-10">
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col text-right">
                <span className="text-orange-400 text-xl font-bold">READY</span>
                <span className="text-blue-300 text-xl font-bold">SET</span>
              </div>
              <span className="text-white text-8xl font-bold">RESET</span>
            </div>
          </div>
          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 w-full max-w-md border border-white/20 absolute bottom-8 left-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-10 h-10 md:w-12 md:h-12 text-white" />
              <h3 className="text-white font-bold text-base md:text-lg">
                Secure Password Recovery
              </h3>
            </div>
            <div className="space-y-3 text-white/90 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <p>
                  <strong>Step 1:</strong> Enter your email address and we'll
                  send you a verification code.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <p>
                  <strong>Step 2:</strong> Enter the OTP sent to your email.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <p>
                  <strong>Step 3:</strong> Set your new password.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-4/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          {step === "email" ? (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Forgot Password
              </h2>
              <p className="text-center mb-10 text-sm">
                Enter your email address and we'll send you a verification code.
              </p>

              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Mail className="w-4 h-4 text-teal-500" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...emailForm.register("email")}
                    className={`border-gray-300 ${
                      emailForm.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <p className="text-sm text-center mt-4">
                  Remember your password?{" "}
                  <Link href="/signin" className="text-blue-800">
                    Sign In
                  </Link>
                </p>
              </form>
            </>
          ) : step === "otp" ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-800">Enter OTP</h2>
              </div>
              <p className="text-center mb-10 text-sm">
                We've sent a 6-digit code to {email}
              </p>

              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="otp"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-teal-500" />
                    Verification Code
                  </Label>
                  <Input
                    key={`otp-${step}`} // Force re-render when step changes
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    {...otpForm.register("otp")}
                    className={`border-gray-300 text-center text-lg tracking-widest ${
                      otpForm.formState.errors.otp ? "border-red-500" : ""
                    }`}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-red-600">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-0 h-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-800">
                  Set New Password
                </h2>
              </div>
              <p className="text-center mb-10 text-sm">
                Enter your new password below.
              </p>

              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    {...passwordForm.register("newPassword")}
                    className={`border-gray-300 ${
                      passwordForm.formState.errors.newPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    {...passwordForm.register("confirmPassword")}
                    className={`border-gray-300 ${
                      passwordForm.formState.errors.confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {passwordLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
