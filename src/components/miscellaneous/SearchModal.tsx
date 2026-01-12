"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SearchResultDTO,
  SearchCollegeDTO,
  SearchExamDTO,
  SearchCourseGroupDTO,
  SearchArticleDTO,
} from "@/api/@types/search-type";
import { getSearchData } from "@/api/individual/getSearchData";
import { Clock, Delete, History, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "../utils/useMobile";
import slugify from "slug";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

type SearchItem =
  | SearchCollegeDTO
  | SearchExamDTO
  | SearchCourseGroupDTO
  | SearchArticleDTO;

// Type guard functions
const isCollegeItem = (item: SearchItem): item is SearchCollegeDTO => {
  return "college_id" in item && "college_name" in item;
};

const isExamItem = (item: SearchItem): item is SearchExamDTO => {
  return "exam_id" in item && "exam_name" in item;
};

const isCourseGroupItem = (item: SearchItem): item is SearchCourseGroupDTO => {
  return "course_group_id" in item && "full_name" in item;
};

const isArticleItem = (item: SearchItem): item is SearchArticleDTO => {
  return "article_id" in item && "title" in item;
};

const SearchModal: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchData, setSearchData] = useState<SearchResultDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentSearches, setRecentSearches] = useState<SearchResultDTO | null>(
    null
  );

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    setRecentSearches(saved ? JSON.parse(saved) : null);

    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await getSearchData();
        if (mounted) setSearchData(data);
      } catch (err: any) {
        if (mounted) setError(err.message);
      }
    };
    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const openModal = useCallback(() => setIsOpen(true), []);
  const isMobile = useIsMobile();
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 100),
    []
  );

  const filteredResults = useMemo(() => {
    if (!searchData || !searchTerm) return null;

    const lowerSearch = searchTerm.toLowerCase();
    const filterItems = <T extends { [key: string]: any }>(
      items: T[],
      keys: string[]
    ): T[] =>
      items
        .filter((item) =>
          keys.some((key) =>
            String(item[key]).toLowerCase().includes(lowerSearch)
          )
        )
        .slice(0, 4);

    return {
      college_search: filterItems(searchData.college_search, [
        "college_name",
        "short_name",
        "slug",
      ]),
      exam_search: filterItems(searchData.exam_search, [
        "exam_name",
        "exam_shortname",
        "slug",
      ]),
      course_group_search: filterItems(searchData.course_group_search, [
        "name",
        "full_name",
      ]),
      articles_search: filterItems(searchData.articles_search, [
        "title",
        "tags",
        "slug",
      ]),
    };
  }, [searchData, searchTerm]);

  const mixedResults = useMemo(
    () =>
      filteredResults
        ? [
            ...filteredResults.college_search,
            ...filteredResults.exam_search,
            ...filteredResults.course_group_search,
            ...filteredResults.articles_search,
          ].slice(0, 8)
        : [],
    [filteredResults]
  );

  const mixedRecentSearches = useMemo(
    () =>
      recentSearches
        ? [
            ...recentSearches.college_search,
            ...recentSearches.exam_search,
            ...recentSearches.course_group_search,
            ...recentSearches.articles_search,
          ].slice(0, 8)
        : [],
    [recentSearches]
  );

  const clearSingleSearch = useCallback(
    (slug: string) => {
      if (!recentSearches) return;

      const updatedSearches = {
        college_search: recentSearches.college_search.filter(
          (item) => item.slug !== slug
        ),
        exam_search: recentSearches.exam_search.filter(
          (item) => item.slug !== slug
        ),
        course_group_search: recentSearches.course_group_search.filter(
          (item) => item.slug !== slug
        ),
        articles_search: recentSearches.articles_search.filter(
          (item) => item.slug !== slug
        ),
      };

      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    },
    [recentSearches]
  );

  const clearAllSearches = useCallback(() => {
    localStorage.removeItem("recentSearches");
    setRecentSearches(null);
  }, []);

  const handleResultClick = useCallback(
    (item: SearchItem, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
      }

      const type = isCollegeItem(item)
        ? "college_search"
        : isExamItem(item)
        ? "exam_search"
        : isCourseGroupItem(item)
        ? "course_group_search"
        : "articles_search";

      // Build the href
      let href = "#";
      if (isCollegeItem(item)) {
        href = `/colleges/${item.slug.replace(/-\d+$/, "")}-${item.college_id}`;
      } else if (isExamItem(item)) {
        href = `/exams/${item.slug.replace(/-\d+$/, "")}-${item.exam_id}`;
      } else if (isCourseGroupItem(item)) {
        href = `/colleges-for-${slugify(item.full_name)}`;
      } else if (isArticleItem(item)) {
        href = `/articles/${item.slug.replace(/-\d+$/, "")}-${item.article_id}`;
      }

      setRecentSearches((prev) => {
        const newSearches = prev
          ? { ...prev }
          : {
              college_search: [],
              exam_search: [],
              course_group_search: [],
              articles_search: [],
            };

        // Prevent duplicates
        if (!newSearches[type].some((i) => i.slug === item.slug)) {
          // Use type guards to properly assign items to their respective arrays
          if (type === "college_search" && isCollegeItem(item)) {
            newSearches.college_search = [
              item,
              ...newSearches.college_search,
            ].slice(0, 8);
          } else if (type === "exam_search" && isExamItem(item)) {
            newSearches.exam_search = [item, ...newSearches.exam_search].slice(
              0,
              8
            );
          } else if (
            type === "course_group_search" &&
            isCourseGroupItem(item)
          ) {
            newSearches.course_group_search = [
              item,
              ...newSearches.course_group_search,
            ].slice(0, 8);
          } else if (type === "articles_search" && isArticleItem(item)) {
            newSearches.articles_search = [
              item,
              ...newSearches.articles_search,
            ].slice(0, 8);
          }
          localStorage.setItem("recentSearches", JSON.stringify(newSearches));
        }

        return newSearches;
      });

      closeModal();
      router.push(href);
    },
    [closeModal, router]
  );

  const RenderSection = useMemo(
    () =>
      React.memo(
        ({
          items,
          searchTerm,
          showDelete = false,
        }: {
          items: SearchItem[];
          searchTerm: string;
          showDelete?: boolean;
        }) => {
          if (!items.length) return null;

          const highlightText = (text: string, term: string) => {
            if (!term) return text;
            const regex = new RegExp(`(${term})`, "gi");
            return text.split(regex).map((part, i) =>
              part.toLowerCase() === term.toLowerCase() ? (
                <span key={i} className="bg-primary-1">
                  {part}
                </span>
              ) : (
                part
              )
            );
          };

          return (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => {
                let type: string;
                let labelKey: string;
                let idKey: string;
                let displayName: string;
                let itemId: number;

                if (isCollegeItem(item)) {
                  type = "colleges";
                  labelKey = "college_name";
                  idKey = "college_id";
                  displayName = item.college_name;
                  itemId = item.college_id;
                } else if (isExamItem(item)) {
                  type = "exams";
                  labelKey = "exam_name";
                  idKey = "exam_id";
                  displayName = item.exam_name;
                  itemId = item.exam_id;
                } else if (isCourseGroupItem(item)) {
                  type = "courses";
                  labelKey = "full_name";
                  idKey = "course_group_id";
                  displayName = item.full_name;
                  itemId = item.course_group_id;
                } else {
                  type = "articles";
                  labelKey = "title";
                  idKey = "article_id";
                  displayName = item.title;
                  itemId = item.article_id;
                }

                return (
                  <li key={item.slug} className="py-3 px-1 hover:bg-gray-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start flex-1 gap-3 text-[15px]">
                        <span className="pt-1">
                          <Clock className="w-3 h-3 text-gray-500 shrink-0" />
                        </span>
                        <Link
                          href={`/colleges-for-${item.slug}`}
                          className="flex-1 leading-snug text-gray-900 line-clamp-2"
                          onClick={() => handleResultClick(item)}
                        >
                          {highlightText(displayName || "", searchTerm)}
                        </Link>
                      </div>
                      {showDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => clearSingleSearch(item.slug)}
                          className="text-gray-500 hover:text-red-500 ml-2"
                          tabIndex={0}
                          aria-label="Remove search from history"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        }
      ),
    [closeModal, clearSingleSearch, handleResultClick]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
      } else {
        closeModal();
      }
    },
    [closeModal]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={openModal}
          className={`rounded-full hover:text-primary-main hover:bg-gray-100 ${
            isMobile ? "p-0" : ""
          }`}
          aria-label="Open search"
        >
          {isMobile ? (
            <div className="flex items-center font-semibold gap-3">
              <Search className="w-9 h-9" /> Search
            </div>
          ) : (
            <Search className="w-10 h-10 text-[#919EAB]" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="z-102 min-h-[400px] max-w-[95vw] md:max-w-[60vw] max-h-[90vh] rounded-lg">
        <DialogTitle className="text-2xl font-bold mt-4 md:mt-0">
          <span className="text-primary-main">Discover</span> Colleges
        </DialogTitle>

        <div className="relative">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                debouncedSearch(e.target.value)
              }
              value={searchTerm}
              placeholder="Search colleges, courses, exams"
              className="pl-10 rounded-full text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
          </div>
          {searchTerm && (
            <div className="absolute left-0 right-0 mt-2 bg-white overflow-y-scroll max-h-[250px] rounded-2xl shadow-lg border border-gray-100 z-50">
              {mixedResults.length > 0 ? (
                <ul>
                  {mixedResults.map((item) => {
                    let title = "";
                    let subtitle = "";
                    let href = "#";

                    if (isCollegeItem(item)) {
                      title = item.college_name;
                      subtitle = "UNIVERSITY";
                      href = `/colleges/${item.slug.replace(/-\d+$/, "")}-${
                        item.college_id
                      }`;
                    } else if (isExamItem(item)) {
                      title = item.exam_name;
                      subtitle = "EXAM";
                      href = `/exams/${item.slug.replace(/-\d+$/, "")}-${
                        item.exam_id
                      }`;
                    } else if (isCourseGroupItem(item)) {
                      title = item.full_name;
                      subtitle = "SPECIALISATION";
                      href = `/colleges-for-${item.slug}`;
                    } else if (isArticleItem(item)) {
                      title = item.title;
                      subtitle = "ARTICLE";
                      href = `/articles/${item.slug.replace(/-\d+$/, "")}-${
                        item.article_id
                      }`;
                    }

                    return (
                      <li
                        key={item.slug}
                        className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleResultClick(item)}
                      >
                        <Search className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-[16px] text-gray-900 truncate">
                            {title}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold tracking-wide mt-0.5 uppercase">
                            {subtitle}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-5 py-4 text-center text-gray-500">
                  No results found for '{searchTerm}'.
                </div>
              )}
              <div className="bg-green-100 text-center py-3 rounded-b-2xl text-[16px] font-medium text-gray-700">
                Not listed?{" "}
                <Link href="/request" className="text-green-600 underline">
                  Request it!
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="md:p-4">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : !searchData ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <>
              {mixedRecentSearches.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-bold tracking-wide text-gray-700">
                      Recent Searches
                    </h3>
                    <Button
                      variant="ghost"
                      onClick={clearAllSearches}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <RenderSection
                      items={mixedRecentSearches}
                      searchTerm=""
                      showDelete
                    />
                  </div>
                </>
              )}
              {mixedRecentSearches && mixedRecentSearches.length === 0 && (
                <div className="flex items-center justify-center h-48">
                  <p className="text-center text-gray-500">
                    No Recent Searches Found.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
