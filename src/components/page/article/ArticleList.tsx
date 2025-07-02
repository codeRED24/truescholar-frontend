"use client";

import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { ArticleDataPropsDTO } from "@/api/@types/Articles-type";
import ArticleListCard from "@/components/cards/ArticleListCard";

const ArticleSkeleton = () => (
  <div className="animate-pulse p-4 mb-4 bg-gray-100 rounded-2xl">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
  </div>
);


const ArticleList = () => {
  const [articles, setArticles] = useState<ArticleDataPropsDTO[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const pageSize = 16;

  const fetchArticles = useCallback(
    async (currentPage: number) => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/articles?page=${currentPage}&pageSize=${pageSize}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_BEARER_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch articles");

        const { data, totalItems: total } = await response.json();
        setArticles((prev) => {
          const newArticles = [...prev, ...data];
          return Array.from(
            new Map(
              newArticles.map((article) => [article.article_id, article])
            ).values()
          );
        });
        setTotalItems(total);
        setHasMore(data.length === pageSize);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    fetchArticles(1);
  }, []);

  const handleScroll = useCallback(
    debounce(() => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (!isLoading && hasMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchArticles(nextPage);
            return nextPage;
          });
        }
      }
    }, 200),
    [isLoading, hasMore, fetchArticles]
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLDivElement;
            element.classList.remove("opacity-0");
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll(".article-card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [articles]);

  return (
    <div className="container-body py-8">
      <h1 className="text-lg md:text-3xl font-bold mb-6">Articles</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {articles.slice(4).map((article) => (
          <div
            key={article.article_id}
            className="article-card opacity-0 transition-opacity"
          >
            <ArticleListCard article={article} />
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, index) => (
            <ArticleSkeleton key={index} />
          ))}
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-gray-500 mt-6">
          No more articles to load
        </p>
      )}

      {!isLoading && articles.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No articles found</p>
      )}
    </div>
  );
};

export default ArticleList;
