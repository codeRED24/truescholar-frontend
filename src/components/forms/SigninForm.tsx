"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/api/auth/auth";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setApiError(null);

      const response = await login(data);
      console.log("Login response:", response);

      // Clear form fields and reset password visibility
      reset({
        email: "",
        password: "",
      });
      setShowPassword(false);

      // Redirect to returnUrl if present, otherwise to home page
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      if (error.message) {
        setApiError(error.message);
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Something went wrong!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="">
      {apiError && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="identifier"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4 text-teal-500" />
            Email
          </Label>
          <Input
            id="email"
            placeholder="Enter your email"
            {...register("email")}
            className={`border-gray-300 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Lock className="w-4 h-4 text-teal-500" />
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className={`border-gray-300 pr-10 ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {!showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}

          <div className="mt-2 text-sm">
            Forget Password?{" "}
            <a href="/forgot-password" className="text-blue-800 font-medium">
              Regain Access Now!
            </a>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-900 hover:bg-blue-800 hover:text-white text-white font-medium py-2.5 rounded-lg"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-sm text-center mt-4">
          First Time? Let's dive right in and get you{" "}
          <Link
            href={
              returnUrl
                ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}`
                : "/signup"
            }
            className="text-blue-800"
          >
            Registered!
          </Link>
        </p>
      </form>
    </div>
  );
}
