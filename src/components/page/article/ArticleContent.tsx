import React from "react";
import { sanitizeHtml } from "@/components/utils/sanitizeHtml";
import { formatDate } from "@/components/utils/formatDate";
import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import Share from "@/components/miscellaneous/Share";

const ArticleContent: React.FC<{ article: ArticleDataPropsDTO }> = ({
  article,
}) => {
  const { updated_at, title, content } = article;

  const sanitizedHtml = sanitizeHtml(content || "");
  return (
    <article>
      <div className="blog-head container-body pt-28 flex justify-between items-center h-56">
        <div className="w-full">
          <h1 className="text-white font-bold font-public text-2xl line-clamp-2">
            {title}
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-[#919EAB]">
              Latest Update: {formatDate(updated_at ?? "")}
            </p>
            <Share />
          </div>
        </div>
      </div>
      <section className="container-body pt-6 md:pt-12">
        {content && <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />}
      </section>
    </article>
  );
};

export default ArticleContent;
