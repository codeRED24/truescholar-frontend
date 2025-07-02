import ExamsList from "@/components/page/exam/ExamList";
import React from "react";

const page = () => {
  return (
    <div>
      <ExamsList />
    </div>
  );
};

export default page;

// "use client";
// import { ExamInformationDTO } from "@/api/@types/exam-type";
// import { getExams } from "@/api/list/getExams";
// import ExamFilters from "@/components/filters/ExamFilter";
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { X } from "lucide-react";
// import ExamListCard from "@/components/cards/ExamListCard";

// interface ExamsResponse {
//   exams: ExamInformationDTO[];
//   total: number;
//   limit: number;
//   page: number;
// }

// const CACHE_KEY = "cached_exams_data";
// const CACHE_DURATION = 5 * 60 * 1000;

// const SkeletonExamCard: React.FC = () => (
//   <div className="border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse bg-white">
//     <div className="flex items-center mb-4">
//       <div className="w-12 h-12 bg-gray-200 rounded-full mr-4" />
//       <div className="flex-1 space-y-2">
//         <div className="h-5 bg-gray-200 rounded w-3/4" />
//         <div className="h-4 bg-gray-200 rounded w-1/2" />
//       </div>
//     </div>
//     <div className="space-y-3">
//       {[...Array(5)].map((_, i) => (
//         <div key={i} className={`h-4 bg-gray-200 rounded w-${6 - i}/6`} />
//       ))}
//     </div>
//   </div>
// );

// const Exams: React.FC = () => {
//   const parseInitialFilters = useCallback(() => {
//     if (typeof window === "undefined")
//       return { category: [], streams: [], level: [] };

//     const params = new URLSearchParams(window.location.search);
//     const getParam = (key: string) =>
//       params.get(key) ? [params.get(key)!] : [];
//     return {
//       category: getParam("exam_category"),
//       streams: getParam("exam_streams"),
//       level: getParam("exam_level"),
//     };
//   }, []);

//   const [exams, setExams] = useState<ExamInformationDTO[]>([]);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [total, setTotal] = useState(0);
//   const [filters, setFilters] = useState(parseInitialFilters());
//   const observer = useRef<IntersectionObserver | null>(null);
//   const isInitialMount = useRef(true);

//   const getCachedData = useCallback(() => {
//     const cached = sessionStorage.getItem(CACHE_KEY);
//     if (cached) {
//       const { data, timestamp } = JSON.parse(cached);
//       if (Date.now() - timestamp < CACHE_DURATION) return data;
//       sessionStorage.removeItem(CACHE_KEY);
//     }
//     return null;
//   }, []);

//   const setCachedData = useCallback((data: ExamsResponse) => {
//     sessionStorage.setItem(
//       CACHE_KEY,
//       JSON.stringify({ data, timestamp: Date.now() })
//     );
//   }, []);

//   const fetchExams = useCallback(
//     async (pageNum: number) => {
//       const cachedData = pageNum === 1 ? getCachedData() : null;
//       if (
//         cachedData &&
//         pageNum === 1 &&
//         !filters.category.length &&
//         !filters.streams.length &&
//         !filters.level.length
//       ) {
//         setExams(cachedData.exams);
//         setTotal(cachedData.total);
//         setHasMore(cachedData.exams.length < cachedData.total);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const selectedFilters: Record<string, string> = {};
//         if (filters.category.length)
//           selectedFilters["exam_category"] = filters.category[0];
//         if (filters.streams.length)
//           selectedFilters["exam_streams"] = filters.streams[0];
//         if (filters.level.length)
//           selectedFilters["exam_level"] = filters.level[0];

//         const response: ExamsResponse = await getExams({
//           page: pageNum,
//           pageSize: 16,
//           selectedFilters,
//         });

//         setExams((prev) => {
//           if (pageNum === 1) return response.exams;
//           const newExams = response.exams.filter(
//             (exam) => !prev.some((e) => e.exam_id === exam.exam_id)
//           );
//           return [...prev, ...newExams];
//         });

//         setTotal(response.total);
//         setHasMore(
//           response.exams.length > 0 &&
//             exams.length + response.exams.length < response.total
//         );

//         if (
//           pageNum === 1 &&
//           !filters.category.length &&
//           !filters.streams.length &&
//           !filters.level.length
//         ) {
//           setCachedData({
//             exams: response.exams,
//             total: response.total,
//             limit: response.limit,
//             page: response.page,
//           });
//         }
//       } catch (err) {
//         setError("Failed to fetch exams. Please try again.");
//         console.error("Fetch Exams Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [exams.length, filters, getCachedData, setCachedData]
//   );

//   useEffect(() => {
//     if (isInitialMount.current) {
//       fetchExams(1);
//       isInitialMount.current = false;
//     } else {
//       fetchExams(page);
//     }
//   }, [page, fetchExams]);

//   const handleFilterChange = useCallback(
//     (newFilters: {
//       category: string[];
//       streams: string[];
//       level: string[];
//     }) => {
//       setFilters(newFilters);
//       const params = new URLSearchParams();
//       if (newFilters.category.length)
//         params.set("exam_category", newFilters.category[0]);
//       if (newFilters.streams.length)
//         params.set("exam_streams", newFilters.streams[0]);
//       if (newFilters.level.length)
//         params.set("exam_level", newFilters.level[0]);
//       const newUrl = `${window.location.pathname}${
//         params.toString() ? `?${params.toString()}` : ""
//       }`;
//       window.history.pushState({}, "", newUrl);
//     },
//     []
//   );

//   const clearFilter = useCallback(
//     (type: keyof typeof filters, value: string) => {
//       const newFilters = { ...filters, [type]: [] };
//       setFilters(newFilters);
//       handleFilterChange(newFilters);
//     },
//     [filters, handleFilterChange]
//   );

//   useEffect(() => {
//     if (!isInitialMount.current) {
//       setPage(1);
//       fetchExams(1);
//     }
//   }, [filters, fetchExams]);

//   const lastExamRef = useCallback(
//     (node: HTMLDivElement | null) => {
//       if (loading || !hasMore) return;
//       if (observer.current) observer.current.disconnect();

//       observer.current = new IntersectionObserver(
//         (entries) => {
//           if (entries[0].isIntersecting) setPage((prev) => prev + 1);
//         },
//         { threshold: 0.1 }
//       );

//       if (node) observer.current.observe(node);
//     },
//     [loading, hasMore]
//   );

//   const SelectedFiltersDisplay = () => {
//     const allSelected = [
//       ...filters.category.map((val) => ({ type: "category", value: val })),
//       ...filters.streams.map((val) => ({ type: "streams", value: val })),
//       ...filters.level.map((val) => ({ type: "level", value: val })),
//     ];

//     if (!allSelected.length) return null;

//     return (
//       <div className="flex flex-wrap gap-2 my-2">
//         {allSelected.map(({ type, value }) => (
//           <span
//             key={`${type}-${value}`}
//             className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
//           >
//             {value}
//             <button
//               onClick={() => clearFilter(type as keyof typeof filters, value)}
//               className="ml-1 focus:outline-none"
//               aria-label={`Clear ${value} filter`}
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </span>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="container-body mx-auto py-8 min-h-screen ">
//       <div className="flex md:justify-between items-center flex-wrap">
//         <h1 className="text-3xl font-bold text-gray-800 md:mb-8 text-center md:text-left">
//           Explore Exams
//         </h1>
//         <SelectedFiltersDisplay />
//       </div>

//       <div className="flex flex-col md:flex-row gap-6">
//         <ExamFilters
//           onFilterChange={handleFilterChange}
//           initialFilters={filters}
//         />
//         <div className="flex-1">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {exams.map((exam, index) => (
//               <div
//                 key={exam.exam_id}
//                 ref={index === exams.length - 1 ? lastExamRef : null}
//               >
//                 <ExamListCard exam={exam} />
//               </div>
//             ))}
//             {loading && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                 {[...Array(Math.max(0, Math.min(3, 15 - exams.length)))].map(
//                   (_, index) => (
//                     <SkeletonExamCard key={`skeleton-${index}`} />
//                   )
//                 )}
//               </div>
//             )}
//           </div>

//           {!loading && !hasMore && exams.length > 0 && (
//             <div className="text-center mt-8 text-gray-500 text-sm">
//               No more exams to load ({exams.length}/{total})
//             </div>
//           )}

//           {exams.length === 0 && !loading && !error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-2xl shadow-sm">
//               No Exam with selected FIlter
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Exams;

