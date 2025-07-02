"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { SearchResultDTO } from "@/api/@types/search-type";
import { getSearchData } from "@/api/individual/getSearchData";
import { MdOutlineSearch, MdClose, MdDelete } from "react-icons/md";
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

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface SearchItem {
  slug: string;
  college_name?: string;
  exam_name?: string;
  full_name?: string;
  title?: string;
  college_id?: number;
  exam_id?: number;
  course_group_id?: number;
  article_id?: number;
}

const SearchModal: React.FC = () => {
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

    const results = {
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
        "slug",
      ]),
      articles_search: filterItems(searchData.articles_search, [
        "title",
        "tags",
        "slug",
      ]),
    };

    if (Object.values(results).some((arr) => arr.length > 0)) {
      localStorage.setItem("recentSearches", JSON.stringify(results));
      setRecentSearches(results);
    }

    return results;
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
            <ul className="space-y-2">
              {items.map((item) => {
                const type = item.college_name
                  ? "colleges"
                  : item.exam_name
                  ? "exams"
                  : item.full_name
                  ? "courses"
                  : "articles";
                const labelKey = item.college_name
                  ? "college_name"
                  : item.exam_name
                  ? "exam_name"
                  : item.full_name
                  ? "full_name"
                  : "title";
                const idKey = item.college_id
                  ? "college_id"
                  : item.exam_id
                  ? "exam_id"
                  : item.course_group_id
                  ? "course_group_id"
                  : "article_id";

                return (
                  <li
                    key={item.slug}
                    className="flex items-center justify-between"
                  >
                    <Link
                      href={`/${type}/${item.slug.replace(/-\d+$/, "")}-${
                        item[idKey]
                      }`}
                      className="flex-1 p-2 hover:bg-primary-1 transition-colors rounded-full px-4"
                      onClick={closeModal}
                    >
                      {highlightText(item[labelKey] || "", searchTerm)}
                    </Link>
                    {showDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => clearSingleSearch(item.slug)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <MdDelete className="w-5 h-5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          );
        }
      ),
    [closeModal, clearSingleSearch]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={openModal}
          className={`rounded-full  hover:text-primary-main hover:bg-gray-100 ${
            isMobile ? "p-0" : ""
          }`}
          aria-label="Open search"
        >
          {isMobile ? (
            <div className="flex items-center font-semibold gap-3">
              <MdOutlineSearch className="w-9 h-9" /> Search
            </div>
          ) : (
            <MdOutlineSearch className="w-10 h-10 text-[#919EAB]" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[102]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold text-gray-800 mt-4 md:mt-0">
            Discover <span className="text-primary-main">Colleges</span>,
            <span className="text-primary-main"> Exams</span>,
            <span className="text-primary-main"> Articles</span> and
            <span className="text-primary-main"> Courses</span>
          </DialogTitle>
        </DialogHeader>

        <div className="">
          <div className="relative">
            <MdOutlineSearch className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Input
              type="text"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                debouncedSearch(e.target.value)
              }
              value={searchTerm}
              placeholder="Search colleges, exams, courses, articles..."
              className="pl-10 rounded-full"
              autoFocus
            />
          </div>
        </div>

        <div className="md:p-4 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : !searchData ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : searchTerm && !mixedResults.length ? (
            <p className="text-center text-gray-500">
              No results found for {searchTerm}.
            </p>
          ) : searchTerm ? (
            <RenderSection items={mixedResults} searchTerm={searchTerm} />
          ) : mixedRecentSearches.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-gray-700 uppercase">
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
              <RenderSection
                items={mixedRecentSearches}
                searchTerm=""
                showDelete
              />
            </>
          ) : (
            <p className="text-center text-gray-500">
              Start typing to search...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
