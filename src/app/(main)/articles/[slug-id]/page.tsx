import { notFound, redirect } from "next/navigation";
import Script from "next/script";
import { getArticlesById } from "@/api/individual/getArticlesById";
import "@/app/styles/tables.css";
import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import ArticleContent from "@/components/page/article/ArticleContent";

const BASE_URL = "https://www.truescholar.in";

const parseSlugId = (slugId: string): { slug: string; id: number } | null => {
  const match = slugId.match(/(.+)-(\d+)$/);
  return match ? { slug: match[1], id: Number(match[2]) } : null;
};

const generateCorrectSlugId = (article: ArticleDataPropsDTO): string =>
  `${article.slug.replace(/\s+/g, "-").toLowerCase()}-${article.article_id}`;

const generateSchema = (
  article: ArticleDataPropsDTO,
  correctSlugId: string
) => {
  const articleUrl = `${BASE_URL}/articles/${correctSlugId}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: article.title,
        description: article.meta_desc,
        url: articleUrl,
      },
      {
        "@type": "BlogPosting", // ✅ Better than generic Article
        headline: article.title,
        description: article.meta_desc || "Details of article",
        author: {
          "@type": "Person",
          name: article.author?.author_name || "Unknown Author",
          url: article.author?.author_id
            ? `${BASE_URL}/team/${article.author.author_id}`
            : undefined,
        },
        datePublished: article.created_at,
        dateModified: article.updated_at,
        image:
          article.img1_url || article.img2_url
            ? {
                "@type": "ImageObject",
                url: article.img1_url || article.img2_url,
                width: 1200, // ✅ Recommended by Google
                height: 1200,
              }
            : undefined,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": articleUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "TrueScholar",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/logo-dark.webp`,
            width: 600,
            height: 100,
          },
        },
      },
    ],
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) {
  const resolvedParams = await params;
  const slugId = resolvedParams["slug-id"];
  const parsed = parseSlugId(slugId);
  if (!parsed) return { title: "Article Not Found" };

  const article = await getArticlesById(parsed.id);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.meta_desc || "Read this article on TrueScholar",
  };
}

export default async function ArticleIndividual({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) {
  const resolvedParams = await params;
  const slugId = resolvedParams["slug-id"];
  const parsed = parseSlugId(slugId);
  if (!parsed) return notFound();

  const article = await getArticlesById(parsed.id);
  if (!article) return notFound();

  const correctSlugId = generateCorrectSlugId(article);
  if (parsed.slug !== correctSlugId.split("-").slice(0, -1).join("-")) {
    redirect(`/articles/${correctSlugId}`);
  }

  const schemaData = generateSchema(article, correctSlugId);

  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <ArticleContent article={article} />
    </>
  );
}
