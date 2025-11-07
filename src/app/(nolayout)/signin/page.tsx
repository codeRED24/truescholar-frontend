"use client";

import SigninForm from "@/components/forms/SigninForm";
import Image from "next/image";
import { Suspense } from "react";

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row overflow-hidden shadow-xl min-h-screen">
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
        <div className="w-full lg:w-5/12 bg-gradient-to-br min-h-screen from-white to-gray-100 p-6 md:p-8 flex flex-col justify-center items-center">
          <div className="max-w-md w-full  flex flex-col">
            <h2 className="text-2xl font-bold text-center  text-gray-800">
              Log In
            </h2>
            <p className="text-center mb-10 text-sm">
              Back for more? Log in now to explore your options!
            </p>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  Loading...
                </div>
              }
            >
              <SigninForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
