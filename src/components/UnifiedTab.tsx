"use client";

import React, { useRef, useCallback, useEffect } from "react";
import {
  AuthorTabType,
  StandardizedContentItem,
} from "@/app/hooks/useAuthorTabData";
import { useInfiniteAuthorTabData } from "@/app/hooks/useInfiniteAuthorTabData";
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

interface UnifiedTabProps {
  authorId: string;
  type: AuthorTabType;
}

const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case "article":
      return "bg-blue-100 text-blue-800";
    case "exam":
      return "bg-orange-100 text-orange-800";
    case "college":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryDisplayName = (category: string) => {
  switch (category) {
    case "article":
      return "Article";
    case "exam":
      return "Exam";
    case "college":
      return "College";
    default:
      return "Content";
  }
};

export function UnifiedTab({ authorId, type }: UnifiedTabProps) {
  const {
    data: items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    total,
  } = useInfiniteAuthorTabData<StandardizedContentItem>({
    authorId,
    type,
    limit: 10,
  });

  // Ref for intersection observer
  const observerRef = useRef<HTMLDivElement>(null);

  // Intersection observer callback
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loadingMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loadingMore, loading, loadMore]
  );

  // Set up intersection observer
  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleObserver]);

  const typeDisplayName = type.charAt(0).toUpperCase() + type.slice(1);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">
          <p>
            Failed to load {typeDisplayName.toLowerCase()}: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-6">
        <div className="text-gray-500 text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-lg font-medium mb-2">
            No {typeDisplayName.toLowerCase()} found
          </p>
          <p className="text-sm">
            This author hasn't published any {typeDisplayName.toLowerCase()}{" "}
            yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="space-y-4">
        {items.map((item: StandardizedContentItem) => (
          <div key={item.id}>
            <Link
              href={
                item.category === "exam"
                  ? `/exams/${(item.entity_name ?? "exam")
                      .replace(/\s+/g, "-")
                      .toLowerCase()}-${item.id}`
                  : `/articles/${item.slug}-${item.id}`
              }
            >
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  {item.img1_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.img1_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeStyle(
                          item.category
                        )} ml-2 flex-shrink-0`}
                      >
                        {getCategoryDisplayName(item.category)}
                      </span>
                    </div>

                    {item.meta_desc && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.meta_desc}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {item.updated_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Updated:{" "}
                            {new Date(item.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        <span>Read more</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Loading indicator for pagination */}
      {loadingMore && (
        <div className="mt-6 text-center">
          <div className="animate-pulse">
            <div className="border rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && (
        <div
          ref={observerRef}
          className="h-10 flex items-center justify-center"
        >
          <div className="text-gray-400 text-sm">
            {loadingMore ? "Loading more..." : "Scroll for more"}
          </div>
        </div>
      )}

      {/* Stats footer */}
      {total !== undefined && (
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Showing {items.length} of {total} {typeDisplayName.toLowerCase()}
            {!hasMore && items.length > 0 && " • All content loaded"}
          </p>
        </div>
      )}
    </div>
  );
}
