import React from "react";
import {
  getCollegeById,
  getCollegeNewsById,
} from "@/api/individual/getIndividualCollege";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CollegeHead from "@/components/page/college/assets/CollegeHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import Image from "next/image";
import { createSlugFromTitle } from "@/components/utils/utils";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildCollegeBreadcrumbTrail,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

const formatDateWord = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const trimText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const parseSlugId = (slugId: string) => {
  const match = slugId.match(/(.+)-(\d+)$/);
  if (!match) return null;
  const collegeId = Number(match[2]);
  return isNaN(collegeId) ? null : { collegeId, slug: match[1] };
};

export async function generateMetadata(props: {
  params: Promise<{ "slug-id": string }>;
}) {
  const params = await props.params;
  const slugId = params["slug-id"];
  const parsed = parseSlugId(slugId);

  if (!parsed) {
    return generateErrorMetadata("not-found", "college");
  }

  try {
    const { collegeId } = parsed;
    const college = await getCollegeById(collegeId);

    if (!college) {
      return generateErrorMetadata("not-found", "college");
    }

    const { college_information } = college;

    // Use the unified metadata generator (using generic tab since news isn't a standard tab)
    return generatePageMetadata({
      type: "college-tab",
      data: {
        college_id: collegeId,
        college_name: college_information.college_name,
        slug: college_information.slug,
        city: college_information.city,
        state: college_information.state,
        logo_img: college_information.logo_img,
        tab: "generic" as any,
        tabContent: {
          title: `${college_information.college_name} News`,
          meta_desc: `Latest news and updates from ${college_information.college_name}.`,
        },
      },
    });
  } catch {
    return generateErrorMetadata("error", "college");
  }
}

export const revalidate = 43200; // 12 hours (revalidationTimes.collegeSub)

const CollegeNews = async ({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) => {
  const { "slug-id": slugId } = await params;
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const { collegeId } = parsed;
  const college = await getCollegeNewsById(collegeId);
  if (!college?.college_information || !college?.news_section)
    return notFound();

  const { college_information, news_section } = college;

  const newsList = college.news_section;
  const collegeName =
    college.college_information?.college_name || "Unknown College";
  const trimmedCollegeName =
    college.college_information?.slug?.replace(/(?:-\d+)+$/, "") ||
    collegeName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${trimmedCollegeName}-${collegeId}`;

  if (slugId !== correctSlugId) {
    redirect(`/colleges/${correctSlugId}/news`);
  }

  if (!newsList || newsList.length === 0) {
    return notFound();
  }

  // Generate schema using the SEO library
  const schema = generatePageSchema({
    type: "college-tab",
    data: {
      college_id: collegeId,
      college_name: college_information.college_name,
      slug: college_information.slug,
      logo_img: college_information.logo_img,
      city: college_information.city,
      state: college_information.state,
      location: college_information.location,
      college_website: college_information.college_website,
      college_email: college_information.college_email,
      college_phone: college_information.college_phone,
    },
    tab: "news",
    tabLabel: "News",
    tabPath: "/news",
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildCollegeBreadcrumbTrail(
    college_information.college_name,
    correctSlugId,
    "generic" as any
  );

  // Override the last breadcrumb to say "News"
  if (breadcrumbItems.length > 0) {
    breadcrumbItems[breadcrumbItems.length - 1] = {
      name: "News",
      href: `/colleges/${correctSlugId}/news`,
      current: true,
    };
  }

  const extractedData = {
    college_id: college_information.college_id,
    college_name: college_information.college_name,
    college_logo: college_information.logo_img,
    city: college_information.city,
    state: college_information.state,
    title: college_information.college_name,
    location: college_information.location,
    college_brochure: college_information.college_brochure || "/",
  };

  return (
    <div className="bg-gray-2 min-h-screen">
      <JsonLd data={schema} id="college-news-schema" />
      <CollegeHead data={extractedData} />
      <CollegeNav data={college_information} />
      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-3 mt-4">
          <Image src="/ads/static.svg" height={250} width={500} alt="ads" />
        </div>
        <div className="col-span-9 mt-4">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mb-4"
            showSchema={false}
          />
          <div className="flex gap-4 flex-col">
            {newsList.map(
              (newsItem: {
                id: number;
                title: string;
                updated_at: string;
                meta_desc?: string;
              }) => (
                <div
                  key={newsItem.id}
                  className="p-4 bg-white shadow-md rounded-2xl"
                >
                  <Link
                    href={`/colleges/${correctSlugId}/news/${createSlugFromTitle(
                      newsItem.title
                    )}-${newsItem.id}`}
                  >
                    <h2 className="text-lg font-medium hover:underline">
                      {newsItem.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600">
                    {formatDateWord(newsItem.updated_at)}
                  </p>
                  {newsItem.meta_desc && (
                    <div
                      className="text-gray-700 mt-2"
                      dangerouslySetInnerHTML={{
                        __html: trimText(newsItem.meta_desc, 150),
                      }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeNews;
