import React from "react";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCourseByCollegeId } from "@/api/individual/getCourseByCollegeId";
import { CollegeRanking } from "@/api/@types/college-course";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import { formatFeeRange } from "@/components/utils/utils";
import "@/app/styles/tables.css";
import RatingComponent from "@/components/miscellaneous/RatingComponent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string; "silos-slug-id": string }>;
}): Promise<{ title: string; description?: string }> {
  const resolvedParams = await params;
  let { "silos-slug-id": courseSlugCourseId } = resolvedParams;

  const dynamicParam = courseSlugCourseId.split("-");
  courseSlugCourseId = dynamicParam.join("-");

  const courseMatch = courseSlugCourseId.match(/(.+)-(\d+)$/);
  if (!courseMatch) return { title: "Page Not Found" };

  const courseId = Number(courseMatch[2]);
  if (isNaN(courseId)) return { title: "Invalid Course ID" };

  const courseDetails = await getCourseByCollegeId(courseId);
  if (!courseDetails || !courseDetails.college_information) {
    return { title: "Course Not Found" };
  }

  const collegeName =
    courseDetails.college_information?.college_name || "Unknown College";
  const courseName =
    courseDetails.college_wise_course?.name || "Unknown Course";

  return {
    title: `${courseName} - ${collegeName} Details` || "College Courses",
    description:
      courseDetails.college_information?.meta_desc ||
      `Explore details about ${collegeName} and its courses.`,
  };
}

export default async function CoursesByClg({
  params,
}: {
  params: Promise<{ "slug-id": string; "silos-slug-id": string }>;
}) {
  const resolvedParams = await params;
  let { "slug-id": slugId, "silos-slug-id": courseSlugCourseId } = resolvedParams;

  if (courseSlugCourseId === "admission-process") {
    redirect(`/colleges/${slugId}/admission`);
  }

  let dynamicParam = courseSlugCourseId.split("-");
  dynamicParam = dynamicParam.slice(1);
  courseSlugCourseId = dynamicParam.join("-");

  const courseMatch = courseSlugCourseId.match(/(.+)-(\d+)$/);
  if (!courseMatch) return notFound();

  const courseId = Number(courseMatch[2]);
  if (isNaN(courseId)) return notFound();

  const courseDetails = await getCourseByCollegeId(courseId);
  if (!courseDetails) return notFound();

  const {
    college_information,
    college_wise_course,
    course_group_section,
    college_rankings_section,
    college_wise_fees_section,
    college_placement_section,
  } = courseDetails;
  const clgName = college_information?.slug || "Default College Name";
  const collegeId = college_information?.college_id;
  const placementSectionData = college_placement_section || [];

  const sortedPlacementData = [...placementSectionData].sort((a, b) =>
    a.year && b.year ? b.year - a.year : 0
  );

  const trimmedCollegeName = clgName
    .replace(/-\d+$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const correctSlugId = `${trimmedCollegeName}-${collegeId}`;

  const courseSlug = (college_wise_course?.name || course_group_section.full_name)
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  const correctCourseSlugId = `${courseSlug}-${courseId}`;

  if (slugId !== correctSlugId || courseSlugCourseId !== correctCourseSlugId) {
    return redirect(`/colleges/${correctSlugId}/course-${correctCourseSlugId}`);
  }

  const feesInfo = college_wise_fees_section[0] || {};
  const groupedRankings: CollegeRanking[] = college_rankings_section || [];

  const tocItems: { id: string; label: string; available: boolean }[] = [
    {
      id: "course-highlights",
      label: "Course Highlights",
      available: !!college_wise_course?.description,
    },
    {
      id: "course-eligibility",
      label: "Eligibility",
      available: !!college_wise_course?.eligibility_description,
    },
    { id: "course-fees", label: "Fees", available: !!Object.keys(feesInfo).length },
    {
      id: "course-admission-process",
      label: "Admission Process",
      available: !!college_wise_course?.admission_process,
    },
    {
      id: "course-ranking-section",
      label: "Ranking Section",
      available: groupedRankings.length > 0,
    },
    {
      id: "course-overview",
      label: "Course Overview",
      available: !!college_wise_course?.overview,
    },
    {
      id: "course-syllabus",
      label: "Course Syllabus",
      available: !!college_wise_course?.syllabus,
    },
  ];

  const extractedData = {
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    location: college_information.location,
    title: `${college_wise_course?.name} - ${college_information.college_name}`,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <div className="bg-gray-2">
      <CollegeHead data={extractedData} />
      <CollegeNav data={courseDetails.college_information} activeTab="Courses" />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <div className="article-content-body mb-6">
            <h2 className="font-bold text-sm md:text-lg">Table of Contents</h2>
            <div className="space-y-2">
              {tocItems
                .filter((item) => item.available)
                .map((item) => (
                  <div key={item.id} className="toc-item">
                    <a href={`#${item.id}`}>{item.label}</a>
                  </div>
                ))}
            </div>
          </div>
          <section className="article-content-body">
            <h2 className="text-2xl font-semibold" id="course-highlights">
              {college_wise_course.name} at{" "}
              {college_information?.short_name || college_information?.college_name}
              <span className="text-primary-main"> Highlights</span>
            </h2>
            <p>{college_wise_course.description}</p>
            <div className="table-container-p">
              <table>
                <thead>
                  <tr>
                    <th>Particulars</th>
                    <th>Highlights Overview</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Course Name</td>
                    <td>{college_wise_course.name || "-"}</td>
                  </tr>
                  <tr>
                    <td>Duration</td>
                    <td>
                      {college_wise_course.duration
                        ? `${college_wise_course.duration} ${college_wise_course.duration_type}`
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Total Tuition Fees <span className="text-red-500">*</span>
                    </td>
                    <td>
                      {formatFeeRange(
                        feesInfo.tution_fees_min_amount,
                        feesInfo.tution_fees_max_amount
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      Average Package <span className="text-red-500">*</span>
                    </td>
                    <td>{formatFeeRange(college_wise_course.salary, 0)}</td>
                  </tr>
                  {college_wise_course.eligibility &&
                    !/X:\s*0\.0,\s*XII:\s*0\.0,\s*Graduation:\s*0\.0/.test(
                      college_wise_course.eligibility
                    ) && (
                      <tr>
                        <td>Eligibility</td>
                        <td>{college_wise_course.eligibility}</td>
                      </tr>
                    )}
                  <tr>
                    <td>
                      Total Seats <span className="text-red-500">*</span>
                    </td>
                    <td>{college_wise_course.total_seats || "-"}</td>
                  </tr>
                  <tr>
                    <td>Brochure</td>
                    <td>
                      {college_wise_course.course_brochure ? (
                        <Link
                          href={college_wise_course.course_brochure}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-6 hover:underline"
                        >
                          Download Brochure
                        </Link>
                      ) : (
                        "Brochure not available"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <div
            dangerouslySetInnerHTML={{
              __html: college_wise_course?.highlight || "",
            }}
          />
          {college_wise_course?.eligibility_description && (
            <div className="article-content-body">
              <h2 className="text-2xl font-semibold" id="course-eligibility">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Eligibility</span>
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: college_wise_course?.eligibility_description || "",
                }}
              />
            </div>
          )}
          {feesInfo && Object.keys(feesInfo).length > 0 && (
            <div className="mb-6 article-content-body" id={`pdf-table-${feesInfo.collegewise_fees_id}`}>
              <h2 className="text-2xl font-semibold" id="course-fees">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Fees 2025</span>
              </h2>
              <div className="flex justify-between items-center flex-wrap mb-2">
                <p className="font-light text-sm text-gray-5">
                  {college_wise_course.name}
                </p>
              </div>
              <div className="rounded-lg overflow-auto border border-gray-2 no-copy">
                <table className="couse-table rounded-lg">
                  <thead>
                    <tr className="bg-gray-1 border-b border-dashed border-gray-3 rounded-t-lg">
                      <th className="font-semibold text-sm">Particulars</th>
                      <th className="font-semibold text-sm">
                        Amount for {feesInfo.duration}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "Tuition",
                        feeRange: formatFeeRange(feesInfo.tution_fees_min_amount, feesInfo.tution_fees_max_amount),
                        description: "Tuition fee is calculated on the basis of 1st year/semester. Actual amount may vary.",
                      },
                      {
                        label: "One Time Payment",
                        feeRange: formatFeeRange(feesInfo.min_one_time_fees, feesInfo.max_one_time_fees),
                        description: "Includes Admission fees, Student welfare fund, Institute Security Deposits, etc.",
                      },
                      {
                        label: "Hostel",
                        feeRange: formatFeeRange(feesInfo.min_hostel_fees, feesInfo.max_hostel_fees),
                        description: "Fees include components other than hostel fees like Meal Plan.",
                      },
                      {
                        label: "Other Fees",
                        feeRange: formatFeeRange(feesInfo.min_other_fees, feesInfo.max_other_fees),
                        description: "Includes other fees which may vary.",
                      },
                      {
                        label: "Total Fees",
                        feeRange: formatFeeRange(feesInfo.total_min_fees, feesInfo.total_max_fees),
                      },
                    ].map((fee, index) => (
                      <tr key={index}>
                        <td className="text-sm font-semibold">
                          {fee.label}
                          {fee.description && (
                            <span className="block leading-4 md:leading-5 font-light text-xs text-gray-5">
                              {fee.description}
                            </span>
                          )}
                        </td>
                        <td>{fee.feeRange}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {college_wise_course?.admission_process && (
            <div className="mb-6 article-content-body">
              <h2 className="text-2xl font-semibold" id="course-admission-process">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Admission Process</span>
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: college_wise_course?.admission_process || "",
                }}
              />
            </div>
          )}
          {groupedRankings.length > 0 && (
            <div>
              {Object.entries(
                groupedRankings.reduce((map: Record<string, CollegeRanking[]>, ranking: CollegeRanking) => {
                  const agency = ranking.ranking_agency_name || "Unknown Agency";
                  map[agency] = map[agency] || [];
                  map[agency].push(ranking);
                  return map;
                }, {})
              ).map(([agency, rankings]) => {
                const agencyLogo = rankings[0]?.ranking_agency_image || "";
                return (
                  <div key={agency} className="agency-section mb-6 article-content-body">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1">
                        {agencyLogo && (
                          <Image
                            src={agencyLogo}
                            height={1000}
                            width={1000}
                            alt={agency}
                            className="w-12"
                            loading="lazy"
                          />
                        )}
                        <h6 className="text-sm text-gray-700 font-semibold">{agency}</h6>
                      </div>
                    </div>
                    <div className="table-container-ranking" id={`pdf-table-${agency}`}>
                      <table className="bg-white w-full">
                        <thead>
                          <tr>
                            <th>Year</th>
                            <th>Rank Title</th>
                            <th>Rank</th>
                            <th>Stream</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankings.map((ranking: CollegeRanking) => (
                            <tr key={`${ranking.college_ranking_id}-${ranking.year}`}>
                              <td>{ranking.year}</td>
                              <td>{ranking.rank_title || `${agency}-${ranking.year}`}</td>
                              <td className="font-medium flex items-center gap-1">
                                #<span>{ranking.rank}</span>
                                {ranking.rank === 1 && <span className="text-[17px]">🥇</span>}
                                {ranking.rank === 2 && <span className="text-[17px]">🥈</span>}
                                {ranking.rank === 3 && <span className="text-[17px]">🥉</span>}
                              </td>
                              <td>{ranking.category}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {college_wise_course?.overview && (
            <div className="mb-6 article-content-body">
              <h2 className="text-2xl font-semibold" id="course-overview">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Overview</span>
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: college_wise_course?.overview || "",
                }}
              />
            </div>
          )}
          {college_wise_course?.syllabus && (
            <div className="mb-6 article-content-body">
              <h2 className="text-2xl font-semibold" id="course-syllabus">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Syllabus</span>
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: college_wise_course?.syllabus || "",
                }}
              />
            </div>
          )}
          {sortedPlacementData.length > 0 && (
            <section className="article-content-body mb-6" id="course-placement">
              <h2 className="text-2xl font-semibold">
                {college_wise_course.name} at{" "}
                {college_information?.short_name || college_information?.college_name}
                <span className="text-primary-main"> Placement Section</span>
              </h2>
              <div className="table-container-p">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th>Particulars</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlacementData.map((item) => (
                      <tr key={item.collegewise_placement_id}>
                        <td className="flex items-center gap-4">
                          <span className="px-3 rounded-full bg-[#141A21] text-white">
                            {item.year}
                          </span>
                          {item.particulars}
                        </td>
                        <td>{item.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <RatingComponent />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
      </section>
    </div>
  );
}