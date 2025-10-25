import React from "react";
import { getCollegeById } from "@/api/individual/getIndividualCollege";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import { notFound } from "next/navigation";
import Image from "next/image";
import CollegeNews from "@/components/page/college/assets/CollegeNews";
import ReviewsContent from "@/components/page/college/assets/ReviewsContent";

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

const CollegeReviewsPage = async (props: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const params = await props.params;
  const { "slug-id": slugId } = params;
  const parsed = parseSlugId(slugId);
  if (!parsed) {
    return notFound();
  }

  const { collegeId } = parsed;

  const college = await getCollegeById(collegeId);
  if (!college) {
    return notFound();
  }

  const { college_information, news_section } = college;

  const extractedData = {
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    college_brochure: college_information.college_brochure || "/",
    title: college_information.college_name,
    location: college_information.location,
  };

  const correctSlugId = `${college_information.slug.replace(
    /(?:-\d+)+$/,
    ""
  )}-${collegeId}`;

  return (
    <>
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <section className="container-body md:grid grid-cols-4 gap-4 py-4">
        <div className="col-span-3 order-none md:order-1">
          <ReviewsContent
            collegeId={collegeId}
            collegeName={college_information.college_name}
          />
        </div>
        <div className="col-span-1 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
          <CollegeNews news={news_section} clgSlug={correctSlugId} />
        </div>
      </section>
    </>
  );
};

export default CollegeReviewsPage;
