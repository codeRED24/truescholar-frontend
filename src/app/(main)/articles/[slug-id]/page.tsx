import { notFound, redirect } from "next/navigation";
import { getArticlesById } from "@/api/individual/getArticlesById";
import "@/app/styles/tables.css";
import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import ArticleContent from "@/components/page/article/ArticleContent";
import {
  generatePageMetadata,
  generatePageSchema,
  generateErrorMetadata,
  JsonLd,
  buildArticleBreadcrumbTrail,
  buildArticleUrl,
  ArticleData,
  ArticleSchemaInput,
} from "@/lib/seo";

export const revalidate = 43200; // 12 hours (revalidationTimes.article)

const parseSlugId = (slugId: string): { slug: string; id: number } | null => {
  const match = slugId.match(/(.+)-(\d+)$/);
  return match ? { slug: match[1], id: Number(match[2]) } : null;
};

const generateCorrectSlugId = (article: ArticleDataPropsDTO): string =>
  `${article.slug.replace(/\s+/g, "-").toLowerCase()}-${article.article_id}`;

/**
 * Map ArticleDataPropsDTO to ArticleData for metadata generation
 */
const mapToArticleData = (article: ArticleDataPropsDTO): ArticleData => ({
  article_id: article.article_id,
  title: article.title,
  slug: article.slug,
  meta_desc: article.meta_desc,
  author: article.author,
  category: article.type || undefined,
  img1_url: article.img1_url ?? undefined,
  created_at: article.created_at?.toString(),
  updated_at: article.updated_at?.toString(),
});

/**
 * Map ArticleDataPropsDTO to ArticleSchemaInput for schema generation
 */
const mapToArticleSchemaInput = (
  article: ArticleDataPropsDTO,
): ArticleSchemaInput => ({
  article_id: article.article_id,
  title: article.title,
  slug: article.slug,
  description: article.meta_desc,
  content: article.content,
  img1_url: article.img1_url ?? undefined,
  img2_url: article.img2_url,
  created_at: article.created_at?.toString(),
  updated_at: article.updated_at?.toString(),
  author: article.author,
  category: article.type || undefined,
  tags: article.tags ? article.tags.split(",").map((t) => t.trim()) : undefined,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-id": string }>;
}) {
  const resolvedParams = await params;
  const slugId = resolvedParams["slug-id"];
  const parsed = parseSlugId(slugId);
  if (!parsed) return generateErrorMetadata("not-found", "article");

  const article = await getArticlesById(parsed.id);
  if (!article) return generateErrorMetadata("not-found", "article");

  return generatePageMetadata({
    type: "article",
    data: mapToArticleData(article),
    content: article.content,
  });
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

  const correctUrl = buildArticleUrl(article.slug, article.article_id);
  // Extract correctSlugId
  const correctSlugId = correctUrl.split("/").pop() || "";

  if (slugId !== correctSlugId) {
    return redirect(correctUrl);
  }

  // Generate schema using SEO library
  const schemaData = generatePageSchema({
    type: "article",
    data: mapToArticleSchemaInput(article),
  });

  // Build breadcrumb trail
  const breadcrumbItems = buildArticleBreadcrumbTrail(
    article.title,
    correctSlugId,
    article.type || undefined,
  );

  return (
    <>
      <JsonLd data={schemaData} id="article-schema" />
      <ArticleContent article={article} breadcrumbItems={breadcrumbItems} />
    </>
  );
}
