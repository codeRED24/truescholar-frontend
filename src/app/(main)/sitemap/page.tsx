import { Metadata } from "next";
import Link from "next/link";
import { getSiteMapData } from "./getSiteMapData";

export const metadata: Metadata = {
  title: "Sitemap | TrueScholar",
  description:
    "Complete sitemap of TrueScholar - Find all universities, courses, cities, and student resources in India.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SitemapPage() {
  const sitemapData = await getSiteMapData();

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container-body mx-auto">
        <div className="mb-16">
          <h1 className="text-brand-primary text-center text-5xl font-semibold">
            TrueScholar <span className="text-brand-secondary">Site Map</span>
          </h1>
        </div>

        <div className="mb-12">
          <section>
            <h2 className="text-brand-primary mb-6 text-xl font-semibold">
              Main Pages
            </h2>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3 md:grid-cols-4">
              {sitemapData.static.map((item) => (
                <div key={item.url}>
                  <Link
                    href={item.url}
                    className="font-normal text-gray-700 hover:underline"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        {sitemapData.articles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-brand-primary mb-6 text-xl font-semibold">
              Student Resources
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const itemsPerColumn = Math.ceil(
                  sitemapData.articles.length / 4
                );
                const startIndex = colIndex * itemsPerColumn;
                const endIndex = startIndex + itemsPerColumn;
                const columnItems = sitemapData.articles.slice(
                  startIndex,
                  endIndex
                );

                return (
                  <ul key={colIndex} className="space-y-4">
                    {columnItems.map((article) => (
                      <li key={article.url}>
                        <Link
                          href={article.url}
                          className="font-normal text-gray-700 hover:underline"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })}
            </div>
          </section>
        )}

        {sitemapData.courses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-brand-primary mb-6 text-xl font-semibold">
              Courses
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const itemsPerColumn = Math.ceil(
                  sitemapData.courses.length / 4
                );
                const startIndex = colIndex * itemsPerColumn;
                const endIndex = startIndex + itemsPerColumn;
                const columnItems = sitemapData.courses.slice(
                  startIndex,
                  endIndex
                );

                return (
                  <ul key={colIndex} className="space-y-3">
                    {columnItems.map((course) => (
                      <li key={course.url}>
                        <Link
                          href={course.url}
                          className="font-normal text-gray-700 hover:underline"
                        >
                          {course.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })}
            </div>
          </section>
        )}

        {sitemapData.cities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-brand-primary mb-6 text-xl font-semibold">
              Cities
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const itemsPerColumn = Math.ceil(sitemapData.cities.length / 4);
                const startIndex = colIndex * itemsPerColumn;
                const endIndex = startIndex + itemsPerColumn;
                const columnItems = sitemapData.cities.slice(
                  startIndex,
                  endIndex
                );

                return (
                  <ul key={colIndex} className="space-y-3">
                    {columnItems.map((city) => (
                      <li key={city.url}>
                        <Link
                          href={city.url}
                          className="font-normal text-gray-700 hover:underline"
                        >
                          Colleges in {city.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })}
            </div>
          </section>
        )}

        {sitemapData.exams.length > 0 && (
          <section className="mb-12">
            <h2 className="text-brand-primary mb-6 text-xl font-semibold">
              Exams
            </h2>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, colIndex) => {
                const itemsPerColumn = Math.ceil(sitemapData.exams.length / 4);
                const startIndex = colIndex * itemsPerColumn;
                const endIndex = startIndex + itemsPerColumn;
                const columnItems = sitemapData.exams.slice(
                  startIndex,
                  endIndex
                );

                return (
                  <ul key={colIndex} className="space-y-4">
                    {columnItems.map((exam) => (
                      <li key={exam.exam_id}>
                        <Link
                          href={`/exams/${exam.slug}-${exam.exam_id}`}
                          className="font-normal text-gray-700 hover:underline"
                        >
                          <div className="font-normal">{exam.exam_name}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
