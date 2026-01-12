import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import { formatDateTime } from "@/components/utils/formatDateTime";
import Image from "next/image";
import Link from "next/link";

interface ArticleMainProps {
  data: ArticleDataPropsDTO[];
}

// Main Article Card Component
const MainArticleCard = ({ article }: { article: ArticleDataPropsDTO }) => (
  <div className="relative overflow-hidden rounded-2xl border md:h-[430px]">
    <Image
      src={article.img1_url || "https://d28xcrw70jd98d.cloudfront.net/articles/articleFallback5.webp"}
      height={500}
      width={900}
      className="w-full object-cover max-h-60 md:max-h-full"
      alt={article.title}
      loading="eager"
      priority
    />
    <div className="absolute inset-0 bg-linear-to-t from-black p-4 flex flex-col justify-end">
      <Link
        href={`/articles/${article.slug}-${article.article_id}`}
        className="text-lg font-semibold text-white line-clamp-2 mb-3 hover:underline"
      >
        {article.title}
      </Link>
      <p className="text-sm text-white">{formatDateTime(article.updated_at)}</p>
    </div>
  </div>
);

// Secondary Article Card Component
const ArticleCard = ({ article }: { article: ArticleDataPropsDTO }) => (
  <div className="relative overflow-hidden rounded-2xl md:h-52 shadow-lg transition-transform hover:scale-105">
    <Image
      src={article.img1_url || "https://d28xcrw70jd98d.cloudfront.net/articles/articleFallback4.webp"}
      height={400}
      width={400}
      alt={article.title}
      loading="lazy"
      decoding="async"
      quality={75}
      className="object-cover w-full h-full"
    />
    <div className="absolute inset-0 bg-linear-to-t from-black via-transparent p-3 flex flex-col justify-end">
      {article.tags && (
        <span className="text-xs text-white bg-[#4777C4] rounded-full px-2 py-1 mb-2 inline-block w-fit uppercase">
          {article.tags}
        </span>
      )}
      <Link
        href={`/articles/${article.slug}-${article.article_id}`}
        className="text-sm font-semibold text-white line-clamp-2 mb-1 hover:underline"
      >
        {article.title}
      </Link>
      <p className="text-[10px] text-white">{formatDateTime(article.updated_at)}</p>
    </div>
  </div>
);

export default function ArticleMain({ data }: ArticleMainProps) {
  if (!data?.length) return null;

  const [mainArticle, ...secondaryArticles] = data;

  return (
    <section className="container-body pt-6 md:pt-14">
      <h2 className="text-lg md:text-3xl font-bold mb-6">Featured News</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <MainArticleCard article={mainArticle} />
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          {secondaryArticles.slice(0, 2).map((article) => (
            <ArticleCard key={article.article_id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}