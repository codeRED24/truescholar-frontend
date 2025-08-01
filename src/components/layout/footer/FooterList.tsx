"use client";
import {
  FooterCollege,
  HeaderCollege,
  HeaderCourse,
  HeaderExam,
} from "@/api/@types/header-footer";
import { getNavData } from "@/api/list/getNavData";
import { FacebookIcon, Instagram, LinkedinIcon } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";

const FooterSection = ({
  title,
  data,
  keyExtractor,
  getUrl,
}: {
  title: string;
  data: any[];
  keyExtractor: (item: any) => string;
  getUrl: (item: any) => string;
}) => (
  <section className="space-y-2 text-center sm:text-start">
    <h3 className="font-medium text-white text-base">{title}</h3>
    <div className="text-[#637381] space-y-1 text-md flex flex-col">
      {data.map((item) => (
        <Link
          href={getUrl(item)}
          key={keyExtractor(item)}
          className="line-clamp-1"
        >
          {item.name || item.college_name || item.exam_shortname}
        </Link>
      ))}
    </div>
  </section>
);

const FooterList = () => {
  const [footerColleges, setFooterColleges] = useState<FooterCollege[]>([]);
  const [universityData, setUniversityData] = useState<HeaderCollege[]>([]);
  const [examSection, setExamSection] = useState<HeaderExam[]>([]);
  const [courseData, setCourseData] = useState<HeaderCourse[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchFooterData = async () => {
    setLoading(true);
    try {
      const {
        footer_colleges: footerColleges,
        university_section: universityData,
        exams_section: examSection,
        course_section: courseData,
      } = await getNavData();
      setFooterColleges(footerColleges.slice(0, 5));
      setUniversityData(universityData.slice(0, 5));
      setExamSection(examSection.slice(0, 5));
      setCourseData(courseData.slice(0, 5));
    } catch (error) {
      console.error("Error loading footer data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  const SkeletonLoader = () => (
    <div className={responsiveGridClasses}>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-6 bg-gray-300 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded-md w-3/4 animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  const responsiveGridClasses = useMemo(() => {
    return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 py-6";
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className={responsiveGridClasses}>
      <FooterSection
        title="Top Colleges"
        data={footerColleges}
        keyExtractor={(item) => item.college_id}
        getUrl={(item) => `/colleges/${item.slug}-${item.college_id}`}
      />
      <FooterSection
        title="Popular Courses"
        data={courseData}
        keyExtractor={(item) => item.course_group_id}
        // getUrl={(item) => `/courses/${item.slug}-${item.course_group_id}`}
        getUrl={(item) => `/`}
      />
      <FooterSection
        title="Top Universities"
        data={universityData}
        keyExtractor={(item) => item.college_id}
        getUrl={(item) => `/colleges/${item.slug}-${item.college_id}`}
      />
      <FooterSection
        title="Upcoming Exams"
        data={examSection}
        keyExtractor={(item) => item.exam_id}
        getUrl={(item) => `/exams/${item.slug}-${item.exam_id}`}
      />
      <section className="col-span-1 xl:col-span-1 flex flex-col items-center sm:items-start">
        <h3 className="font-medium text-white text-base">Navigations</h3>
        <div className="text-[#637381] space-y-1 text-md  flex flex-col items-center sm:items-start">
          <Link href="/contact-us">Contact Us</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Condiitions</Link>
        </div>
      </section>
      <section>
        <h3 className="font-medium text-white text-base mb-2 flex flex-col items-center sm:items-start">
          Social Media
        </h3>
        <div className="flex flex-wrap justify-center space-x-4 sm:justify-start text-white">
          <Link
            href="https://www.facebook.com/profile.php?id=61578705477317"
            className="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600"
            target="_blank"
          >
            <FacebookIcon size={20} />
          </Link>
          <Link
            href="https://www.instagram.com/truescholar_india/"
            className="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600"
            target="_blank"
          >
            <Instagram size={20} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/truescholar-pvt-25b1a7376/"
            className="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600"
            target="_blank"
          >
            <LinkedinIcon size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FooterList;
