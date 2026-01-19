import { getArticles } from "@/api/list/getArticles";
import ArticleList from "@/components/page/article/ArticleList";
import ArticleMain from "@/components/page/article/ArticleMain";
import { Metadata } from "next";
import {
  generateListingMetadata,
  JsonLd,
  buildCollectionPageSchema,
  buildStaticBreadcrumbTrail,
  buildBreadcrumbSchema,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";

export const metadata: Metadata = generateListingMetadata("articles");

export const revalidate = 43200; // 12 hours

export default async function Articles() {
  const { data: articles } = await getArticles();

  // Build breadcrumb trail
  const breadcrumbItems = buildStaticBreadcrumbTrail("Articles", "/articles");

  // Generate schema
  const schema = {
    "@context": "https://schema.org" as const,
    "@graph": [
      buildCollectionPageSchema(
        "Education Articles & News",
        "Explore expert articles on college admissions, scholarships, career planning, and higher education insights.",
        "/articles",
      ),
      buildBreadcrumbSchema(
        breadcrumbItems.map((item) => ({
          name: item.name,
          url: item.href,
        })),
      ),
    ],
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={schema} id="articles-listing-schema" />
      <div className="container-body pt-4 md:pt-12">
        <Breadcrumbs items={breadcrumbItems} showSchema={false} />
      </div>
      <ArticleMain data={articles} />
      <ArticleList />
    </div>
  );
}
