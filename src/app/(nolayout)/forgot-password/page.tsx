"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { requestPasswordReset, phoneNumber } from "@/lib/auth-client";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Phone,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";

type ResetMethod = "email" | "phone";
type Step = "request" | "verify" | "success";

// Schemas
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;
type PasswordFormData = z.infer<typeof newPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>("request");
  const [resetMethod, setResetMethod] = useState<ResetMethod>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);

    try {
      const result = await requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send reset email");
        setIsSubmitting(false);
        return;
      }

      setSubmittedEmail(data.email);
      setStep("success");
      toast.success("Password reset email sent!");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setIsSubmitting(true);

    try {
      const formattedPhone = phoneValue.startsWith("+")
        ? phoneValue
        : `+${phoneValue}`;

      const result = await phoneNumber.requestPasswordReset({
        phoneNumber: formattedPhone,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send OTP");
        setIsSubmitting(false);
        return;
      }

      setSubmittedPhone(formattedPhone);
      setStep("verify");
      toast.success("OTP sent to your phone!");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await phoneNumber.resetPassword({
        phoneNumber: submittedPhone,
        otp: otp,
        newPassword: data.newPassword,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        setIsSubmitting(false);
        return;
      }

      toast.success("Password reset successful!");
      router.push("/signin");
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    setIsSubmitting(true);
    try {
      await phoneNumber.requestPasswordReset({
        phoneNumber: submittedPhone,
      });
      toast.success("OTP resent to your phone!");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setStep("request");
    setSubmittedEmail("");
    setSubmittedPhone("");
    setOtp("");
    setPhoneValue("");
    emailForm.reset();
    phoneForm.reset();
    passwordForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
        {/* Left Side - Image */}
        <div className="w-full hidden lg:w-8/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
          <Image
            src="/lock.png"
            alt="lock"
            priority
            fill
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain z-10 absolute rotate-[15deg] opacity-10"
          />
          <div className="inset-0 absolute bg-gradient-to-b from-[#142D55] to-[#4777C4]"></div>

          <div className="absolute bottom-0 lg:right-28 xl:right-48 w-48 h-[300px] md:w-[280px] md:h-[400px] lg:w-[420px] lg:h-[580px] xl:w-[560px] xl:h-[770px] z-10">
            <Image
              src="/_0033.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={560}
              height={770}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="absolute -bottom-10 -right-10 w-80 h-[520px] md:w-[400px] md:h-[600px] lg:w-[400px] lg:h-[650px] xl:w-[531px] xl:h-[861px] z-10">
            <Image
              src="/_0004.png"
              alt="Students"
              priority
              fetchPriority="high"
              width={531}
              height={861}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-4/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          {/* Email Success State */}
          {step === "success" && resetMethod === "email" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to{" "}
                <strong>{submittedEmail.toLowerCase()}</strong>. Please check
                your inbox and click the link to reset your password.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-blue-800">
                  <strong>Didn't receive the email?</strong>
                  <br />• Check your spam or junk folder
                  <br />• Make sure you entered the correct email
                  <br />• Wait a few minutes and try again
                </p>
              </div>
              <Button
                onClick={resetFlow}
                variant="outline"
                className="w-full mb-4"
              >
                Try a different method
              </Button>
              <Link
                href="/signin"
                className="flex items-center justify-center gap-2 text-blue-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}

          {/* Phone OTP Verification Step */}
          {step === "verify" && resetMethod === "phone" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Verify & Reset Password
                </h2>
                <p className="text-sm text-gray-600">
                  Enter the OTP sent to <strong>{submittedPhone}</strong> and
                  set your new password
                </p>
              </div>

              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                {/* OTP Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Enter OTP</Label>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="w-10 h-10" />
                        <InputOTPSlot index={1} className="w-10 h-10" />
                        <InputOTPSlot index={2} className="w-10 h-10" />
                        <InputOTPSlot index={3} className="w-10 h-10" />
                        <InputOTPSlot index={4} className="w-10 h-10" />
                        <InputOTPSlot index={5} className="w-10 h-10" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendPhoneOtp}
                    disabled={isSubmitting}
                    className="w-full text-sm text-blue-600 hover:text-blue-800"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="w-4 h-4 text-teal-500" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...passwordForm.register("newPassword")}
                      className={`border-gray-300 pr-10 ${
                        passwordForm.formState.errors.newPassword
                          ? "border-red-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="w-4 h-4 text-teal-500" />
                    Confirm Password
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
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
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <button
                onClick={resetFlow}
                className="w-full text-sm text-gray-600 hover:text-gray-800"
              >
                ← Start over
              </button>
            </div>
          )}

          {/* Request Step */}
          {step === "request" && (
            <>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Forgot Password
              </h2>
              <p className="text-center mb-6 text-sm">
                Reset your password using email or phone number
              </p>

              {/* Method Toggle */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setResetMethod("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    resetMethod === "email"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setResetMethod("phone")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    resetMethod === "phone"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Phone
                </button>
              </div>

              {/* Email Form */}
              {resetMethod === "email" && (
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
                    disabled={isSubmitting}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              )}

              {/* Phone Form */}
              {resetMethod === "phone" && (
                <form
                  onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4 text-teal-500" />
                      Phone Number
                    </Label>
                    <PhoneInput
                      country={"in"}
                      value={phoneValue}
                      onChange={(value) => {
                        setPhoneValue(value);
                        phoneForm.setValue("phoneNumber", value);
                      }}
                      inputClass="!w-full !h-10 !text-base !bg-transparent !border-gray-300 !rounded-md"
                      containerClass="!w-full"
                      buttonClass="!border-gray-300 !rounded-l-md !bg-gray-50"
                      dropdownClass="!shadow-lg"
                      enableSearch
                      searchPlaceholder="Search country..."
                    />
                    {phoneForm.formState.errors.phoneNumber && (
                      <p className="text-sm text-red-600">
                        {phoneForm.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                  >
                    {isSubmitting ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              )}

              <p className="text-sm text-center mt-4">
                Remember your password?{" "}
                <Link href="/signin" className="text-blue-800 font-medium">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
