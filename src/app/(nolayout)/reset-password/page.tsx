"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth-client";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("newPassword", "");

  // Password strength calculation
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invalid token state
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
          <div className="w-full hidden lg:w-8/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
            <div className="inset-0 absolute bg-linear-to-b from-[#142D55] to-[#4777C4]"></div>
          </div>
          <div className="w-full lg:w-4/12 bg-linear-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center items-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please
                request a new password reset link.
              </p>
              <Link href="/forgot-password">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Request New Link
                </Button>
              </Link>
              <Link
                href="/signin"
                className="block mt-4 text-blue-800 font-medium"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain z-10 absolute rotate-15 opacity-10"
          />
          <div className="inset-0 absolute bg-linear-to-b from-[#142D55] to-[#4777C4]"></div>

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
        <div className="w-full lg:w-4/12 bg-linear-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          {isSuccess ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Password Reset!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You will be
                redirected to the sign in page shortly.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1 mb-6">
                <div
                  className="bg-blue-600 h-1 rounded-full animate-[progress_3s_ease-in-out]"
                  style={{ width: "100%" }}
                />
              </div>
              <Link href="/signin">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Link
                href={"/"}
                className="text-3xl text-center mb-4 font-extrabold"
              >
                True
                <span className="text-primary-main">Scholar</span>
              </Link>
              <h2 className="text-2xl font-bold text-center text-gray-800">
                Create New Password
              </h2>
              <p className="text-center mb-8 text-sm text-gray-600">
                Enter your new password below. Make sure it's strong and secure.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-teal-500" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("newPassword")}
                      className={`border-gray-300 pr-10 ${
                        errors.newPassword ? "border-red-500" : ""
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
                  {errors.newPassword && (
                    <p className="text-sm text-red-600">
                      {errors.newPassword.message}
                    </p>
                  )}

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < getPasswordStrength()
                                ? strengthColors[getPasswordStrength() - 1]
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Strength:{" "}
                        {strengthLabels[getPasswordStrength() - 1] ||
                          "Very Weak"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="w-4 h-4 text-teal-500" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...register("confirmPassword")}
                      className={`border-gray-300 pr-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border rounded-lg p-3 text-xs text-gray-600">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="space-y-1">
                    <li
                      className={password.length >= 8 ? "text-green-600" : ""}
                    >
                      • At least 8 characters
                    </li>
                    <li
                      className={
                        password.match(/[A-Z]/) ? "text-green-600" : ""
                      }
                    >
                      • At least one uppercase letter
                    </li>
                    <li
                      className={
                        password.match(/[a-z]/) ? "text-green-600" : ""
                      }
                    >
                      • At least one lowercase letter
                    </li>
                    <li
                      className={
                        password.match(/[0-9]/) ? "text-green-600" : ""
                      }
                    >
                      • At least one number
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <p className="text-sm text-center mt-6">
                <Link href="/signin" className="text-blue-800 font-medium">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
