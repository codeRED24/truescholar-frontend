import { InfoSection } from "@/api/@types/college-info";
import { formatDate } from "@/components/utils/formatDate";
import { createSlugFromTitle, trimText } from "@/components/utils/utils";
import Link from "next/link";
import React from "react";

interface CollegeNewsProps {
  news: InfoSection[];
  clgSlug?: string;
}

const CollegeNews: React.FC<CollegeNewsProps> = ({ news, clgSlug }) => {
  return (
    <div>
      {news.length > 0 && (
        <div className="space-y-4 article-content-body">
          <h4 className="text-primary-3 font-semibold text-lg">Latest News</h4>
          {news.slice(0, 5).map((item) => {
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#00A76F14] p-3 w-full"
              >
                <p className="text-[#919EAB] text-sm">
                  {formatDate(item.updated_at)}
                </p>
                <p className="font-medium font-public leading-5 my-2">
                  {trimText(item.title, 52)}
                </p>
                <div className="w-full text-right">
                  <Link
                    href={`/colleges/${clgSlug}/news/${createSlugFromTitle(
                      item.title
                    )}-${item.id}`}
                    className="text-primary-main font-semibold text-sm"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollegeNews;
