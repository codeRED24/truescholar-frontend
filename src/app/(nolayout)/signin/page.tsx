"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import useAuth from "@/hooks/use-auth";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import z from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Enter phone number or email"),
  password: z.string().min(1, "Enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { login: doLogin, loading: authLoading, error: authError } = useAuth();

  // Check authentication status on mount
  useEffect(() => {
    if (user?.id) {
      // if already logged in redirect to home
      router.push("/");
    } else {
      setAuthCheckComplete(true);
    }
  }, [user?.id, router]);

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      setIsSubmitting(false);
      setError("root", {
        type: "manual",
        message: authError,
      });
    }
  }, [authError, setError]);

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
    // Clear any previous errors
    clearErrors();

    setIsSubmitting(true);
    const result = await doLogin(data.identifier, data.password);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message || "Invalid credentials");
      return;
    } else {
      toast.success("Logged in successfully");
    }

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

  // Clear errors when user starts typing
  const handleInputChange = () => {
    if (errors.root) {
      clearErrors("root");
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 lg:flex-row overflow-hidden shadow-xl min-h-screen">
      {/* Left Side - Image and Content */}
      <div className="w-full hidden lg:w-7/12 p-6 md:p-8 lg:p-12 lg:flex flex-col items-center justify-center relative">
        <Image
          src="/lock.png"
          alt="lock"
          priority
          fill
          className="w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] xl:w-[576px] xl:h-[576px] object-contain z-10 absolute rotate-[15deg] sm:rotate-[12deg] lg:rotate-[15deg] opacity-10 "
        />
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
        <div className="absolute bottom-0 lg:right-28 xl:right-48 w-48 h-[300px] md:w-[280px] md:h-[400px] lg:w-[400px] lg:h-[550px] xl:w-[535px] xl:h-[737px] z-20">
          <Image
            src="/_0037.png"
            alt="Students"
            priority
            fetchPriority="high"
            width={535}
            height={737}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute bottom-0 -right-10 w-48 h-[320px] md:w-[280px] md:h-[420px] lg:w-[400px] lg:h-[625px] xl:w-[529px] xl:h-[822px] z-10">
          <Image
            src="/img_0005.png"
            alt="Students"
            priority
            fetchPriority="high"
            width={529}
            height={822}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div className="w-full lg:w-5/12 min-h-screen bg-gradient-to-br from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center items-center">
        <div className="max-w-md w-full  flex flex-col text-center">
          <Link
            href={"/"}
            className="text-primary-main text-3xl md:text-4xl font-extrabold mb-2"
          >
            True<span className="text-gray-800">Scholar</span>
          </Link>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            <span className="text-blue-600">LOG</span>{" "}
            <span className="text-orange-500">IN</span>
          </h2>
          <p className="text-center mb-10 text-sm">
            Back for more? Log in now to explore your options!
          </p>

          {/* Display authentication errors */}
          {errors.root && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 text-center">
                {typeof errors.root.message === "string"
                  ? errors.root.message
                  : "An error occurred"}
              </p>
            </div>
          )}

          {/* Show loading state while checking authentication */}
          {!authCheckComplete ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          ) : (
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
                  onChange={handleInputChange}
                  className={`border-gray-300 ${errors.identifier ? "" : ""} ${
                    errors.root ? " ring-1 ring-red-500" : ""
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
                    onChange={handleInputChange}
                    className={`border-gray-300 pr-10 ${
                      errors.password ? "" : ""
                    } ${errors.root ? " ring-1 ring-red-500" : ""}`}
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
          )}
        </div>
      </div>
    </div>
  );
}
