import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import React from "react";
import { formatDateTime } from "../utils/formatDateTime";
import Link from "next/link";
import { buildArticleUrl } from "@/lib/seo";

const ArticleListCard = React.memo(
  ({ article }: { article: ArticleDataPropsDTO }) => {
    const { title, updated_at, read_time, slug, article_id } = article;

    return (
      <div
        className="px-4 py-2 w-full h-32 md:h-28 bg-white rounded-2xl shadow-card2  relative  transform transition-shadow hover:shadow-2xl"
        aria-label={`Article: ${title}`}
      >
        <p className="text-xsm text-[#919EAB]">{formatDateTime(updated_at)}</p>
        <Link
          href={buildArticleUrl(slug, article_id)}
          className="text-sm md:text-base font-medium font-public line-clamp-2 pt-1 text-[#1C252E]"
        >
          {title}
        </Link>

        <p className="text-xsm text-[#919EAB] absolute bottom-2.5">
          {read_time ? `${read_time} min read` : "Read time unknown"}
        </p>
      </div>
    );
  }
);

ArticleListCard.displayName = "ArticleListCard";

export default ArticleListCard;
