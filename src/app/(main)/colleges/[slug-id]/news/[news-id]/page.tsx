import { getNewsByCollegeId } from "@/api/individual/getNewsByCollegeId";
import NewsHead from "@/components/page/college/assets/NewsHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import { notFound, redirect } from "next/navigation";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import "@/app/styles/tables.css";
import { Metadata } from "next";
import {
  siteConfig,
  buildCanonicalUrl,
  JsonLd,
  buildCollegeNewsBreadcrumbTrail,
  buildBreadcrumbSchema,
  buildNewsArticleSchema,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

export const revalidate = 43200; // 12 hours

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-id": string }>;
}): Promise<Metadata> {
  const { "slug-id": slugId, "news-id": newsSlugId } = await params;

  const collegeMatch = slugId.match(/(.+)-(\d+)$/);
  if (!collegeMatch) return { title: "College Not Found | TrueScholar" };
  const collegeId = Number(collegeMatch[2]);
  if (isNaN(collegeId)) return { title: "Invalid College | TrueScholar" };

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return { title: "News Not Found | TrueScholar" };
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return { title: "Invalid News | TrueScholar" };

  const college = await getNewsByCollegeId(newsId);

  if (!college?.news_section?.[0]) {
    return { title: "News Not Found | TrueScholar" };
  }

  const { title, description, updated_at } = college.news_section[0];
  const collegeName =
    college.college_information?.college_name || "Unknown College";
  const collegeSlug =
    college.college_information?.slug?.replace(/-\d+$/, "") ||
    collegeName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${collegeSlug}-${collegeId}`;
  const newsSlug = newsSlugId.replace(/-\d+$/, "");
  const canonicalPath = `/colleges/${correctSlugId}/news/${newsSlug}-${newsId}`;

  return {
    title: `${title} | ${collegeName} News | TrueScholar`,
    description: description || `Latest news from ${collegeName}.`,
    keywords: `${collegeName}, news, ${newsSlug.replace(/-/g, " ")}, education`,
    alternates: {
      canonical: buildCanonicalUrl(canonicalPath),
    },
    openGraph: {
      title: `${title} | ${collegeName}`,
      description: description || `Latest news from ${collegeName}.`,
      url: buildCanonicalUrl(canonicalPath),
      type: "article",
      publishedTime: updated_at,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${collegeName}`,
      description: description || `Latest news from ${collegeName}.`,
    },
  };
}

const NewsIndividual = async ({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-id": string }>;
}) => {
  const { "slug-id": slugId, "news-id": newsSlugId } = await params;

  const collegeMatch = slugId.match(/(.+)-(\d+)$/);
  if (!collegeMatch) return notFound();
  const collegeId = Number(collegeMatch[2]);
  if (isNaN(collegeId)) return notFound();

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return notFound();
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return notFound();

  const college = await getNewsByCollegeId(newsId);
  if (!college?.college_information || !college?.news_section?.[0])
    return notFound();

  const news = college.news_section[0];
  const collegeName =
    college.college_information.college_name || "Unknown College";
  const collegeSlug =
    college.college_information.slug?.replace(/-\d+$/, "") ||
    collegeName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${collegeSlug}-${collegeId}`;
  const correctNewsSlugId = `${newsSlugId.replace(/-\d+$/, "")}-${newsId}`;

  if (slugId !== correctSlugId || newsSlugId !== correctNewsSlugId) {
    redirect(`/colleges/${correctSlugId}/news/${correctNewsSlugId}`);
  }

  const { title, updated_at, description, author_name } = news;

  // Sanitize the HTML content for proper table rendering
  const sanitizedDescription = sanitizeHtml(description || "");

  // Build visual breadcrumbs
  const breadcrumbItems = buildCollegeNewsBreadcrumbTrail(
    collegeName,
    correctSlugId,
    title,
    correctNewsSlugId
  );

  // Build structured data
  const articleSchema = buildNewsArticleSchema({
    article_id: newsId,
    title,
    slug: correctNewsSlugId,
    description: description || `Latest news from ${collegeName}.`,
    created_at: updated_at,
    updated_at: updated_at,
    author: {
      author_id: 0,
      author_name: author_name || "TrueScholar Team",
    },
    img1_url:
      college.college_information.logo_img ||
      "https://www.truescholar.in/logo-dark.webp",
  });

  // Convert visual breadcrumbs (href) to schema breadcrumbs (url)
  const schemaBreadcrumbs = breadcrumbItems.map((item) => ({
    name: item.name,
    url: item.href,
  }));

  const collegeSchema = {
    "@type": "CollegeOrUniversity",
    name: collegeName,
    logo: college.college_information.logo_img,
    url: college.college_information.college_website,
    email: college.college_information.college_email,
    telephone: college.college_information.college_phone,
    address: college.college_information.location,
  };

  const schema = {
    "@context": "https://schema.org" as const,
    "@graph": [
      articleSchema,
      buildBreadcrumbSchema(schemaBreadcrumbs),
      collegeSchema,
    ],
  };

  return (
    <div className="bg-gray-2 min-h-screen">
      <JsonLd data={schema} id="college-news-schema" />
      <NewsHead data={college} />
      <CollegeNav data={college} />

      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-9">
          <Breadcrumbs items={breadcrumbItems} showSchema={false} />
          {sanitizedDescription && (
            <TocGenerator content={sanitizedDescription} />
          )}
          <div
            className="prose max-w-none mt-4 text-gray-800"
            dangerouslySetInnerHTML={{
              __html:
                sanitizedDescription ||
                "<p>No additional content available.</p>",
            }}
          />
        </div>
        <div className="col-span-3 mt-4"></div>
      </div>
    </div>
  );
};

export default NewsIndividual;
