"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LuBookOpen,
  LuCalendar,
  LuGraduationCap,
  LuUsers,
  LuStar,
  LuAward,
  LuPhoneCall,
} from "react-icons/lu";
import { RiCustomerService2Fill } from "react-icons/ri";
import { SiSimplelogin } from "react-icons/si";
import LeadModal from "@/components/modals/LeadModal";

const AboutUs: React.FC = () => {
  return (
    <div className="relative w-full bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,167,111,0.1)_0%,_transparent_50%)] pointer-events-none" />
      <section className="max-w-6xl mx-auto py-16 md:py-20 px-4 md:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#141A21] mb-4">
          About{" "}
          <span className="bg-gradient-to-r from-primary-main to-[#141A21] bg-clip-text text-transparent">
            TrueScholar
          </span>
        </h1>
        <p className="text-lg text-[#141A21] max-w-3xl mx-auto opacity-80">
          Empowering students with knowledge and opportunities. Explore
          colleges, admissions, and exams in India with TrueScholar—your
          education companion.
        </p>
        <div className="mt-6">
          <LeadModal
            triggerText={
              <span className="flex items-center gap-2">
                <RiCustomerService2Fill /> Get FREE Counselling!
              </span>
            }
          />
        </div>
      </section>
      <section className="bg-white py-12 border-t border-[#00A76F]/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#141A21] mb-6">
            What We Offer
          </h2>
          <p className="text-[#141A21] max-w-2xl mx-auto opacity-80">
            Explore 20+ updates on Admissions, Rankings, Fees, Placements & 500+
            Exams. Access Question Papers, Syllabus, Cutoffs & Important Dates.
            Start now!
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition duration-300 border border-[#00A76F]/10">
          <LuGraduationCap className="mx-auto text-primary-main" size={40} />
          <h3 className="mt-4 text-xl font-semibold text-[#141A21]">
            Explore Colleges
          </h3>
          <p className="mt-2 text-[#141A21] opacity-70">
            Discover top colleges in India with detailed insights on rankings,
            fees, and placements.
          </p>
          <Button
            asChild
            variant="link"
            className="mt-4 text-primary-main hover:text-[#008755]"
          >
            <Link href="/colleges">Learn More</Link>
          </Button>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition duration-300 border border-[#00A76F]/10">
          <LuCalendar className="mx-auto text-primary-main" size={40} />
          <h3 className="mt-4 text-xl font-semibold text-[#141A21]">
            Admissions
          </h3>
          <p className="mt-2 text-[#141A21] opacity-70">
            Stay updated on admission processes, deadlines, and requirements
            across India.
          </p>
          <Button
            asChild
            variant="link"
            className="mt-4 text-primary-main hover:text-[#008755]"
          >
            <Link href="/#">Learn More</Link>
          </Button>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition duration-300 border border-[#00A76F]/10">
          <LuBookOpen className="mx-auto text-primary-main" size={40} />
          <h3 className="mt-4 text-xl font-semibold text-[#141A21]">
            Exams in India
          </h3>
          <p className="mt-2 text-[#141A21] opacity-70">
            Access resources for 500+ exams, including question papers,
            syllabus, and cutoffs.
          </p>
          <Button
            asChild
            variant="link"
            className="mt-4 text-primary-main hover:text-[#008755]"
          >
            <Link href="/exams">Learn More</Link>
          </Button>
        </div>
      </section>
      <section className="bg-[#00A76F]/5 py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl font-semibold text-[#141A21] mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-[#141A21] max-w-3xl mx-auto opacity-80">
            At TrueScholar, we aim to simplify the journey of education by
            providing students with comprehensive, up-to-date information and
            resources to make informed decisions about their future.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8">
        <h2 className="text-3xl font-semibold text-[#141A21] text-center mb-10">
          Why Choose TrueScholar?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4">
            <LuUsers className="text-primary-main" size={36} />
            <h3 className="mt-4 text-lg font-medium text-[#141A21]">
              Community-Driven
            </h3>
            <p className="mt-2 text-[#141A21] opacity-70 text-center">
              Join a thriving community of students and educators sharing
              knowledge and insights.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <LuStar className="text-primary-main" size={36} />
            <h3 className="mt-4 text-lg font-medium text-[#141A21]">
              Trusted Resources
            </h3>
            <p className="mt-2 text-[#141A21] opacity-70 text-center">
              Access verified data and resources curated by education experts.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <LuAward className="text-primary-main" size={36} />
            <h3 className="mt-4 text-lg font-medium text-[#141A21]">
              Proven Success
            </h3>
            <p className="mt-2 text-[#141A21] opacity-70 text-center">
              Helping thousands of students achieve their academic goals every
              year.
            </p>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8 bg-white border-t border-[#00A76F]/20">
        <h2 className="text-3xl font-semibold text-[#141A21] text-center mb-10">
          Our Impact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary-main">50K+</p>
            <p className="mt-2 text-[#141A21] opacity-80">Students Supported</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary-main">500+</p>
            <p className="mt-2 text-[#141A21] opacity-80">Exams Covered</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary-main">20+</p>
            <p className="mt-2 text-[#141A21] opacity-80">Admission Updates</p>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto py-16 px-4 md:px-8 text-center">
        <h2 className="text-3xl font-semibold text-[#141A21] mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-[#141A21] mb-6 opacity-80">
          Join thousands of students who trust TrueScholar for their educational
          needs.
        </p>
        <div className="flex justify-center gap-4">
          <LeadModal
            triggerText={
              <span className="flex items-center gap-2">
               <SiSimplelogin /> Sign Up Now
              </span>
            }
          />
          <Button
            asChild
            variant="outline"
            className="border-primary-main rounded-full text-primary-main hover:text-primary-main hover:bg-[#00A76F]/10 h-10"
          >
            <Link href="/contact-us">
              Contact Us <LuPhoneCall />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
