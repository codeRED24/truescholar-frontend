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

const generateSchema = (article: ArticleDataPropsDTO, correctSlugId: string) => {
  const articleUrl = `${BASE_URL}/articles/${correctSlugId}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: article.title,
      description: article.meta_desc,
      url: articleUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      inLanguage: "en",
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
              height: 800,
              width: 800,
            }
          : undefined,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "truescholar.in",
        logo: {
          "@type": "ImageObject",
          name: "truescholar.in",
          url: `${BASE_URL}/logo-dark.webp`,
          height: 100,
          width: 600,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Articles",
          item: `${BASE_URL}/articles`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: article.title,
          item: articleUrl,
        },
      ],
    },
  ];
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

  const schemas = generateSchema(article, correctSlugId);

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ArticleContent article={article} />
    </>
  );
}