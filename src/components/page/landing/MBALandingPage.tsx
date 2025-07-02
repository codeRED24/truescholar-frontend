"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LuBookOpen,
  LuBriefcase,
  LuDollarSign,
  LuUsers,
  LuStar,
  LuGraduationCap,
  LuGlobe,
} from "react-icons/lu";
import { RiCustomerService2Fill } from "react-icons/ri";
import { FaRocket } from "react-icons/fa";
import LeadModal from "@/components/modals/LeadModal";
import { ApplicationLeadForm } from "@/components/forms/ApplicationLeadForm";
import "@/app/styles/mba.css";

const MBALandingPage: React.FC = () => {
  return (
    <div className="w-full overflow-hidden">
      <section className="bg-gradient-to-br from-[#06B6D4] to-[#0EA5E9] py-24 px-4 md:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-hero-pattern animate-pulse-slow"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#FACC15] rounded-full opacity-30 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-[#EC4899] rounded-full opacity-30 animate-float-delay"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-slide-up text-[#0F172A] drop-shadow-lg">
            Unleash Your MBA Adventure
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 animate-fade-in-delay text-white">
            Skyrocket your career with dazzling MBA programs and expert guidance
            from TrueScholar!
          </p>
          <div className="flex justify-center gap-6">
            <LeadModal
              btnColor="#EC4899"
              triggerText={
                <span className="flex items-center gap-2 text-white  rounded-full animate-bounce-in">
                  <RiCustomerService2Fill
                    className="text-[#FACC15]"
                    size={24}
                  />{" "}
                  Free MBA Chat
                </span>
              }
            />
            <Button
              asChild
              className="bg-[#FACC15] text-[#0F172A] hover:text-white hover:bg-[#EAB308] font-bold h-10 px-6 py-3 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              <Link href="/mba/explore">Blast Off Now</Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="bg-[#F1F5F9] py-20 px-4 md:px-8 relative">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#EC4899] opacity-20 rounded-full blur-3xl animate-float"></div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] text-center mb-16 animate-slide-up">
          Why Choose an MBA?
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: LuBriefcase,
              title: "Career Boost",
              desc: "Launch into leadership with bold skills and unstoppable momentum.",
            },
            {
              icon: LuDollarSign,
              title: "Big Rewards",
              desc: "Snag high-flying roles with dazzling paychecks worldwide.",
            },
            {
              icon: LuUsers,
              title: "Epic Network",
              desc: "Connect with trailblazers and stars across the globe.",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-slide-up-delay relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15] opacity-20 rounded-bl-full animate-pulse-slow"></div>
              <item.icon className="mx-auto text-[#EC4899]" size={48} />
              <h3 className="mt-6 text-2xl font-semibold text-[#0F172A]">
                {item.title}
              </h3>
              <p className="mt-3 text-[#0F172A] opacity-70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-gradient-to-br from-[#0EA5E9] to-[#06B6D4] py-20 px-4 md:px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-diagonal-lines animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#FACC15] opacity-20 rounded-full blur-3xl animate-float"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-[#EC4899] opacity-20 rounded-br-full animate-pulse-slow"></div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-6">
                Jump In Today!
              </h3>
              <ApplicationLeadForm />
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-10 animate-slide-up text-[#0F172A] drop-shadow-md">
              Pick Your MBA Vibe
            </h2>
            <div className="space-y-8">
              {["Full-Time MBA", "Executive MBA", "Online MBA"].map(
                (program, idx) => (
                  <div
                    key={program}
                    className="bg-white text-[#0F172A] rounded-2xl p-8 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 animate-slide-up-delay relative overflow-hidden"
                    style={{ animationDelay: `${idx * 0.2}s` }}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15] opacity-20 rounded-bl-full animate-pulse-slow"></div>
                    <h3 className="text-2xl font-semibold mb-3">{program}</h3>
                    <p className="opacity-70 mb-4">
                      {program === "Full-Time MBA"
                        ? "A 2-year thrill ride for epic career shifts."
                        : program === "Executive MBA"
                        ? "Power up your leadership, no downtime needed."
                        : "Flex your learning with a vibrant online vibe."}
                    </p>
                    <Button
                      asChild
                      variant="link"
                      className="text-[#EC4899] hover:text-[#FACC15] p-0"
                    >
                      <Link
                        href={`/mba/${program.toLowerCase().replace(" ", "-")}`}
                      >
                        Dive In
                      </Link>
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F1F5F9] py-20 px-4 md:px-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EC4899] opacity-20 rounded-full blur-3xl animate-float"></div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] text-center mb-16 animate-slide-up">
          Crush MBA Exams
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {["CAT", "GMAT", "XAT"].map((exam, idx) => (
            <div
              key={exam}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in-delay relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FACC15] opacity-20 rounded-bl-full animate-pulse-slow"></div>
              <LuBookOpen className="mx-auto text-[#EC4899]" size={40} />
              <h3 className="mt-6 text-xl font-medium text-[#0F172A]">
                {exam}
              </h3>
              <p className="mt-3 text-[#0F172A] opacity-70">
                {exam === "CAT"
                  ? "Unlock India’s top IIMs!"
                  : exam === "GMAT"
                  ? "Go global with flair!"
                  : "Shine at XLRI and more!"}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button
            asChild
            className="bg-[#EC4899] hover:bg-[#DB2777] text-white hover:text-white font-semibold py-3 px-8 rounded-full hover:scale-105 transition-transform duration-300 animate-bounce-in shadow-lg"
          >
            <Link href="/mba/exams">Get Prepped</Link>
          </Button>
        </div>
      </section>

      <section className="bg-[#F1F5F9] py-20 px-4 md:px-8 relative">
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#FACC15] opacity-20 rounded-full blur-2xl animate-pulse-slow"></div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] text-center mb-16 animate-slide-up">
          Our Bright Wins
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "97%", label: "Success Rate" },
            { value: "12K+", label: "Students Rocked" },
            { value: "600+", label: "Top Schools" },
            { value: "5+", label: "Years of Wow" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="animate-fade-in-delay relative"
              style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <p className="text-5xl font-bold text-[#EC4899]">{stat.value}</p>
              <p className="mt-2 text-[#0F172A] opacity-70">{stat.label}</p>
              <div className="absolute -bottom-2 left-1/2 w-12 h-1 bg-[#FACC15] rounded-full transform -translate-x-1/2 animate-pulse-slow"></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#EC4899] to-[#DB2777] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-wave-pattern animate-pulse-slow"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-[#FACC15] opacity-30 rounded-full animate-float"></div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] text-center mb-16 animate-slide-up drop-shadow-md">
          Raving Reviews
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              quote: "TrueScholar lit up my MBA path with stellar vibes!",
              name: "Priya S., MBA Student",
            },
            {
              quote: "Total game-changer—my career’s on fire!",
              name: "Rahul K., MBA Graduate",
            },
            {
              quote: "Smooth, fun, and totally epic support!",
              name: "Anita M., Executive MBA",
            },
          ].map((testimonial, idx) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col animate-slide-up-delay relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.2}s` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FACC15] opacity-20 rounded-bl-full animate-pulse-slow"></div>
              <LuStar className="text-[#FACC15] mb-4" size={28} />
              <p className="text-[#0F172A] opacity-80 italic flex-grow">
                "{testimonial.quote}"
              </p>
              <p className="mt-6 text-[#0F172A] font-medium">
                {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#F1F5F9] py-20 px-4 md:px-8 text-center relative">
        <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-[#EC4899] opacity-20 rounded-full blur-3xl animate-float"></div>
        <h2 className="text-3xl md:text-5xl font-bold text-[#0F172A] mb-10 animate-slide-up">
          Shine Worldwide
        </h2>
        <p className="text-lg max-w-3xl mx-auto text-[#0F172A] opacity-70 mb-12 animate-fade-in-delay">
          Partner with global powerhouses and light up your career everywhere!
        </p>
        <div className="flex justify-center gap-12 flex-wrap">
          {["North America", "Europe", "Asia-Pacific"].map((region, idx) => (
            <div
              key={region}
              className="flex items-center gap-3 text-[#EC4899] animate-bounce-in relative"
              style={{ animationDelay: `${idx * 0.3}s` }}
            >
              <LuGlobe size={30} className="text-[#FACC15]" />
              <span className="text-[#0F172A] font-medium text-lg">
                {region}
              </span>
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#EC4899] opacity-50 rounded-full animate-pulse-slow"></div>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
        <LeadModal
          btnColor="#FACC15"
          btnTxt="#0F172A"
          triggerText={
            <span className="flex items-center gap-2 py-3 rounded-full">
              <RiCustomerService2Fill className="text-[#EC4899]" size={24} />{" "}
              Chat Now
            </span>
          }
        />
      </div>

      <section className="bg-gradient-to-br from-[#06B6D4] to-[#0EA5E9] py-24 px-4 md:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-circle-pattern animate-pulse-slow"></div>
        <div className="absolute top-20 left-20 w-24 h-24 bg-[#EC4899] opacity-30 rounded-full animate-float"></div>
        <h2 className="text-3xl md:text-5xl font-bold mb-8 animate-slide-up text-[#0F172A] drop-shadow-lg relative z-10">
          Ready to Sparkle?
        </h2>
        <p className="text-lg md:text-xl mb-10 opacity-90 max-w-3xl mx-auto animate-fade-in-delay relative z-10">
          Join the TrueScholar glow-up and make your MBA dreams dazzlingly real!
        </p>
        <div className="flex justify-center gap-6 relative z-10">
          <Button
            asChild
            className="bg-[#EC4899] text-white hover:bg-[#DB2777] font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform duration-300 animate-bounce-in shadow-lg"
          >
            <Link href="/mba/colleges">Discover Colleges</Link>
          </Button>
          <LeadModal
            btnColor="#FACC15"
            btnTxt="#0F172A"
            triggerText={
              <span className="flex items-center gap-2 rounded-full animate-bounce-in">
                <FaRocket className="text-[#EC4899]" size={24} /> Kickstart Now
              </span>
            }
          />
        </div>
      </section>
    </div>
  );
};

export default MBALandingPage;
