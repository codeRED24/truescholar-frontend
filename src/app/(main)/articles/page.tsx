import { getArticles } from "@/api/list/getArticles";
import ArticleList from "@/components/page/article/ArticleList";
import ArticleMain from "@/components/page/article/ArticleMain";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Articles | TrueScholar.in - College Admission Tips, Career Guidance & Education Insights",
  keywords:
    "college admission tips, career guidance, study abroad advice, best colleges in India, higher education insights, university application tips, academic goals, scholarship tips",
  description:
    "Explore expert articles on college admissions, scholarships, career planning, and higher education insights. Stay informed with TrueScholar's guides for students and professionals.",
  metadataBase: new URL("https://www.truescholar.in"),
  alternates: {
    canonical: "https://www.truescholar.in/articles",
    languages: { "en-US": "/en-US", "de-DE": "/de-DE" },
  },
  openGraph: {
    title:
      "Articles | TrueScholar.in - College Admission Tips, Career Guidance & Education Insights",
    description:
      "Explore expert articles on college admissions, scholarships, career planning, and higher education insights. Stay informed with TrueScholar's guides for students and professionals.",
    url: "https://www.truescholar.in/articles",
    siteName: "TrueScholar",
    images: [
      {
        url: "https://www.truescholar.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Articles | TrueScholar.in - College Admission Tips, Career Guidance & Education Insights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Articles | TrueScholar.in - College Admission Tips, Career Guidance & Education Insights",
    description:
      "Explore expert articles on college admissions, scholarships, career planning, and higher education insights. Stay informed with TrueScholar's guides for students and professionals.",
    images: ["https://www.truescholar.in/og-image.png"],
  },
};

export default async function Articles() {
  const { data: articles } = await getArticles();

  return (
    <div className="min-h-screen">
      <ArticleMain data={articles} />
      <ArticleList />
    </div>
  );
}
