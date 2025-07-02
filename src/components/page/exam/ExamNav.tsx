"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GreExamDTO } from "@/api/@types/exam-type";

interface ExamData {
  data: GreExamDTO;
}

const navItems = [
  { silo: "info", label: "Info", path: "" },
  { silo: "question_papers", label: "Question Paper", path: "/question-paper" },
  { silo: "highlights", label: "Highlights", path: "/highlights" },
  { silo: "application_process", label: "Application Process", path: "/application-process" },
  { silo: "cutoff", label: "Cut-Off", path: "/cut-off" },
  { silo: "eligibility_criteria", label: "Eligibility Criteria", path: "/eligibility-criteria" },
  { silo: "admit_card", label: "Admit Card", path: "/admit-card" },
  { silo: "exam_pattern", label: "Exam Pattern", path: "/exam-pattern" },
  { silo: "books", label: "Books", path: "/books" },
  { silo: "syllabus", label: "Syllabus", path: "/syllabus" },
  { silo: "result", label: "Results", path: "/result" },
  { silo: "news", label: "News", path: "/news" },
  { silo: "centers", label: "Exam Centers", path: "/centers" },
  { silo: "faq", label: "FAQ", path: "/faq" },
  { silo: "answer_key", label: "Answer Key", path: "/answer-key" },
  { silo: "analysis", label: "Analysis", path: "/analysis" },
  { silo: "preperation", label: "Preparation", path: "/preparation" },
  { silo: "counselling", label: "Counselling", path: "/counselling" },
  { silo: "notification", label: "Notification", path: "/notification" },
  { silo: "recruitment", label: "Recruitment", path: "/recruitment" },
  { silo: "vacancies", label: "Vacancies", path: "/vacancies" },
  { silo: "slot_booking", label: "Slot Booking", path: "/slot-booking" },
];

const ExamNav: React.FC<ExamData> = ({ data }) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const { examInformation, distinctSilos } = data;

  const orderedNavItems = useMemo(() => {
    if (!distinctSilos) return [];
    const silosSet = new Set(distinctSilos.map((s) => s.silos));
    return navItems.filter((item) => silosSet.has(item.silo));
  }, [distinctSilos]);

  if (!examInformation || !examInformation.exam_id) return null;

  const baseSlug = (examInformation.exam_name || "default-exam")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const basePath = `/exams/${baseSlug}-${examInformation.exam_id}`;

  useEffect(() => {
    if (navRef.current) {
      const activeElement = navRef.current.querySelector('[aria-current="page"]');
      if (activeElement instanceof HTMLElement) {
        const navWidth = navRef.current.offsetWidth;
        const activeWidth = activeElement.offsetWidth;
        const activeOffset = activeElement.offsetLeft;
        const scrollPosition = activeOffset - (navWidth / 2) + (activeWidth / 2);

        navRef.current.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [pathname, orderedNavItems]);

  return (
    <nav className="bg-white text-[#637381] border border-[#DFE3E8] shadow-sm font-light">
      <div
        ref={navRef}
        className="container-body flex items-center justify-normal gap-2 md:gap-4 overflow-x-auto no-scroll-bar whitespace-nowrap"
      >
        {orderedNavItems.map(({ label, path }, idx) => {
          const fullPath = `${basePath}${path}`;
          const isActive = pathname === fullPath;

          return (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-[#919EAB]">•</span>}
              <Link
                href={fullPath}
                aria-current={isActive ? "page" : undefined}
                className={`my-2 px-3 py-1 text-sm md:text-base transition-colors duration-200 rounded-full ${
                  isActive
                    ? "font-semibold bg-primary-1 text-[#1C252E]"
                    : "bg-transparent text-[#637381] hover:text-black hover:bg-primary-1"
                }`}
              >
                {label}
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default ExamNav;