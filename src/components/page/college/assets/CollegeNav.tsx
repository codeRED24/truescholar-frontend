"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CollegeInformation } from "@/api/@types/college-info";

interface CollegeData {
  data: CollegeInformation;
  activeTab?: string;
}

const CollegeNav: React.FC<CollegeData> = ({ data, activeTab }) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const { college_id, slug, dynamic_fields, additional_fields } = data;

  if (!college_id || !slug || !dynamic_fields || !additional_fields) {
    return null;
  }

  const baseSlug = slug.replace(/-\d+$/, "");
  const basePath = `/colleges/${baseSlug}-${college_id}`;

  const navItems = useMemo(() => {
    const items = [
      { label: "Info", path: "", show: true },
      { label: "Highlights", path: "/highlights", show: dynamic_fields.highlight },
      {
        label: "Courses",
        path: "/courses",
        show: dynamic_fields.courses || additional_fields.college_wise_course_present,
      },
      {
        label: "Fees",
        path: "/fees",
        show: dynamic_fields.fees || additional_fields.college_wise_fees_present,
      },
      { label: "Admission Process", path: "/admission-process", show: dynamic_fields.admission },
      {
        label: "Cutoffs",
        path: "/cutoffs",
        show: dynamic_fields.cutoff || additional_fields.college_cutoff_present,
      },
      {
        label: "Placements",
        path: "/placements",
        show: dynamic_fields.placement || additional_fields.college_wise_placement_present,
      },
      {
        label: "Rankings",
        path: "/rankings",
        show: dynamic_fields.ranking || additional_fields.college_ranking_present,
      },
      { label: "Scholarship", path: "/scholarship", show: dynamic_fields.scholarship },
      { label: "Facilities", path: "/facilities", show: dynamic_fields.facility },
      { label: "FAQ", path: "/faq", show: dynamic_fields.faq },
      { label: "News", path: "/news", show: dynamic_fields.news },
    ].filter((item) => item.show);

    return items;
  }, [dynamic_fields, additional_fields]);

  const defaultActiveTab = activeTab || navItems[0]?.label;

  // Center the active tab when component mounts or activeTab changes
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
  }, [defaultActiveTab, navItems]);

  return (
    <nav
      ref={navRef}
      className="container-body flex items-center gap-2 md:gap-4 bg-white overflow-x-auto no-scroll-bar text-[#637381] border border-[#DFE3E8] shadow-sm font-light whitespace-nowrap"
    >
      {navItems.map(({ label, path }, idx) => {
        const fullPath = `${basePath}${path}`;
        const isActive = activeTab
          ? label === defaultActiveTab
          : pathname === fullPath || (!pathname.includes(basePath + "/") && idx === 0);

        return (
          <React.Fragment key={label}>
            {idx > 0 && <span className="text-[#919EAB] select-none">•</span>}
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
    </nav>
  );
};

export default CollegeNav;