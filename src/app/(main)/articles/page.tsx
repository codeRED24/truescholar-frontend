import { getArticles } from "@/api/list/getArticles";
import ArticleList from "@/components/page/article/ArticleList";
import ArticleMain from "@/components/page/article/ArticleMain";

export default async function Articles() {
  const { data: articles } = await getArticles();

  return (
    <div className="min-h-screen">
      <ArticleMain data={articles} />
      <ArticleList />
    </div>
  );
}