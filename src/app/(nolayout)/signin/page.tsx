"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import useAuth from "@/hooks/use-auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter phone number or email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();

  if (user?.id) {
    // if already logged in redirect to home
    router.push("/");
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { login: doLogin, loading: authLoading, error: authError } = useAuth();

  // Helper function to validate redirect URL
  const isValidRedirect = (url: string): boolean => {
    try {
      const redirectUrl = new URL(url, window.location.origin);
      // Only allow redirects to the same origin for security
      return redirectUrl.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const result = await doLogin(data.identifier, data.password);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message || "Invalid credentials");
      return;
    }

    toast.success("Logged in successfully");

    // Check for stored redirect path
    const redirectTo = sessionStorage.getItem("redirectAfterLogin");
    if (redirectTo && isValidRedirect(redirectTo)) {
      // Clear the stored redirect and navigate to it
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectTo);
    } else {
      // No valid redirect, go to home
      router.push("/");
    }
  };

  useEffect(() => {
    if (authError) {
      setIsSubmitting(false);
    }
  }, [authError]);

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
              <span className="text-white text-8xl font-bold">SIGN IN</span>
            </div>
          </div>
          {/* 3D Characters */}
          {/* <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mb-8 flex justify-center">
            <img
              src="https://i.imgur.com/6XkWvZJ.png"
              alt="Students"
              className="w-full h-full object-contain"
            />
          </div> */}
          {/* Daily Dash Feature */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 w-full max-w-md border border-white/20 absolute bottom-8 left-8">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://i.imgur.com/rFfRtQV.png"
                alt="Gift"
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <h3 className="text-white font-bold text-base md:text-lg">
                Introducing Our Daily Dash Feature!
              </h3>
            </div>
            <div className="space-y-3 text-white/90 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>
                  <strong>Maintain Your Daily Dash:</strong> Engage every day
                  and make your Daily Dash – it's like a daily mission for
                  awesome rewards!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-1 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p>
                  <strong>Level Up:</strong> Keep the Daily Dash alive to level
                  up and unlock cool prizes. Reach milestones like 100 days, 200
                  days, and beyond for extra bonuses!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-4/12 bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center  text-gray-800">
            Log In
          </h2>
          <p className="text-center mb-10 text-sm">
            Back for more? Log in now to explore your options!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="identifier"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Mail className="w-4 h-4 text-teal-500" />
                Phone No/Email
              </Label>
              <Input
                id="identifier"
                placeholder="Enter your phone no or email"
                {...register("identifier")}
                className={`border-gray-300 ${
                  errors.identifier ? "border-red-500" : ""
                }`}
              />
              {errors.identifier && (
                <p className="text-sm text-red-600">
                  {errors.identifier.message}
                </p>
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
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}

              <div className="mt-2 text-sm">
                Forget Password?{" "}
                <a
                  href="/forgot-password"
                  className="text-blue-800 font-medium"
                >
                  Regain Access Now!
                </a>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-sm text-center mt-4">
              First Time? Let’s dive right in and get you{" "}
              <Link href={"/signup"} className="text-blue-800">
                Registered!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
