import { getNewsByCollegeId } from "@/api/individual/getNewsByCollegeId";
import NewsHead from "@/components/page/college/assets/NewsHead";
import CollegeNav from "@/components/page/college/assets/CollegeNav";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import TocGenerator from "@/components/miscellaneous/TocGenerator";
import "@/app/styles/tables.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string; "news-id": string }>;
}) {
  const { "slug-id": slugId, "news-id": newsSlugId } = await params;

  const collegeMatch = slugId.match(/(.+)-(\d+)$/);
  if (!collegeMatch) return { title: "College Not Found" };
  const collegeId = Number(collegeMatch[2]);
  if (isNaN(collegeId)) return { title: "Invalid College" };

  const newsMatch = newsSlugId.match(/(.+)-(\d+)$/);
  if (!newsMatch) return { title: "News Not Found" };
  const newsId = Number(newsMatch[2]);
  if (isNaN(newsId)) return { title: "Invalid News" };

  const college = await getNewsByCollegeId(newsId);

  if (!college?.news_section?.[0]) return { title: "News Not Found" };

  const { title, description, updated_at } = college.news_section[0];
  const collegeName =
    college.college_information?.college_name || "Unknown College";
  const collegeSlug =
    college.college_information?.slug?.replace(/-\d+$/, "") ||
    collegeName.toLowerCase().replace(/\s+/g, "-");
  const correctSlugId = `${collegeSlug}-${collegeId}`;
  const newsSlug = newsSlugId.replace(/-\d+$/, "");

  return {
    title: `${title} | ${collegeName} News`,
    description: description || `Latest news from ${collegeName}.`,
    keywords: `${collegeName}, news, ${newsSlug}, education`,
    alternates: {
      canonical: `https://www.truescholar.in/colleges/${correctSlugId}/news/${newsSlug}-${newsId}`,
    },
    openGraph: {
      title: `${title} | ${collegeName}`,
      description: description || `Latest news from ${collegeName}.`,
      url: `https://www.truescholar.in/colleges/${correctSlugId}/news/${newsSlug}-${newsId}`,
      type: "article",
      publishedTime: updated_at,
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

  const { title, updated_at, description, author_name, author_img, author_id } =
    news;

  // Sanitize the HTML content for proper table rendering
  const sanitizedDescription = sanitizeHtml(description || "");

  // Structured data (JSON-LD)
  const jsonLD = [
    {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: collegeName,
      logo: college.college_information.logo_img,
      url: college.college_information.college_website,
      email: college.college_information.college_email,
      telephone: college.college_information.college_phone,
      address: college.college_information.location,
    },
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      description: description || `Latest news from ${collegeName}.`,
      author: { "@type": "Person", name: author_name || "Unknown Author" },
      datePublished: updated_at,
      dateModified: updated_at,
      image:
        college.college_information.logo_img ||
        "https://www.truescholar.in/logo-dark.webp",
      publisher: {
        "@type": "Organization",
        name: "TrueScholar",
        logo: {
          "@type": "ImageObject",
          url: "https://www.truescholar.in/logo-dark.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.truescholar.in/colleges/${correctSlugId}/news/${correctNewsSlugId}`,
      },
    },
  ];

  return (
    <div className="bg-gray-2 min-h-screen">
      <Script
        id="news-individual-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <NewsHead data={college} />
      <CollegeNav data={college} />

      <div className="container-body lg:grid grid-cols-12 gap-4 pt-4">
        <div className="col-span-9">
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
