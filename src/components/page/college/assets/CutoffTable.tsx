"use client";
import React, { useEffect, useState, useCallback } from "react";
import { getCollegeFilteredCutoffs } from "@/api/individual/getIndividualCollege";
import { LiaAngleDoubleDownSolid as Download, LiaAngleDoubleUpSolid as Upload } from "react-icons/lia";
import CutoffFilterSection from "@/components/filters/CutoffFilterSection";
import { Dispatch, SetStateAction } from "react";

interface CutoffDetails {
  course_group_id: number;
  course_name: string;
  category: string;
  quota: string;
  round: string;
  gender: string;
  reference_url: string;
  course_full_name: string;
  cutoff_type: string;
  ranks: { [year: string]: number | null };
}

interface GroupExam {
  exam_id: number;
  exam_name: string;
  shortname: string;
  slug: string;
  default_filters: {
    category: string;
    quota: string;
    round: string | null;
    gender: string | null;
  };
  filters: {
    category: string[];
    quota: string[];
    round: string[];
    gender: string[];
  };
  cutoffs: CutoffDetails[];
}

interface CutoffTableProps {
  data: GroupExam[];
  collegeId: number;
}

const CutoffTable: React.FC<CutoffTableProps> = React.memo(({ data, collegeId }) => {
  const [examData, setExamData] = useState<{
    cutoffs: Record<number, Record<string, Record<number, number | null>>>;
    filters: Record<number, Record<string, string | null>>;
    pages: Record<number, number>;
    hasMore: Record<number, boolean>;
    expanded: Record<number, boolean>; // New state to track expanded tables
  }>({
    cutoffs: {},
    filters: {},
    pages: {},
    hasMore: {},
    expanded: {},
  });

  const ROWS_PER_PAGE = 4; // Constant for initial visible rows

  const getUniqueYears = useCallback((cutoffs: CutoffDetails[]): number[] => {
    return [...new Set(
      cutoffs
        .flatMap(cutoff => Object.keys(cutoff.ranks).map(Number))
        .filter(year => !isNaN(year))
    )].sort((a, b) => b - a);
  }, []);

  const groupCutoffs = useCallback((cutoffs: CutoffDetails[]) => {
    return cutoffs.reduce((acc, cutoff) => {
      if (cutoff.course_full_name) {
        acc[cutoff.course_full_name] = acc[cutoff.course_full_name] || {};
        Object.entries(cutoff.ranks).forEach(([year, rank]) => {
          acc[cutoff.course_full_name][Number(year)] = rank;
        });
      }
      return acc;
    }, {} as Record<string, Record<number, number | null>>);
  }, []);

  useEffect(() => {
    if (!data?.length) return;

    setExamData(prev => {
      const newCutoffs = { ...prev.cutoffs };
      const newPages = { ...prev.pages };
      const newHasMore = { ...prev.hasMore };
      const newExpanded = { ...prev.expanded };

      data.forEach(exam => {
        if (!prev.cutoffs[exam.exam_id]) {
          const grouped = groupCutoffs(exam.cutoffs || []);
          newCutoffs[exam.exam_id] = grouped;
          newPages[exam.exam_id] = 1;
          newHasMore[exam.exam_id] = Object.keys(grouped).length >= 5;
          newExpanded[exam.exam_id] = false; // Initially collapsed
        }
      });

      return { ...prev, cutoffs: newCutoffs, pages: newPages, hasMore: newHasMore, expanded: newExpanded };
    });
  }, [data, groupCutoffs]);

  const handleFiltersChange = useCallback((examId: number) => 
    (filters: Record<string, string | null>) => {
      setExamData(prev => ({
        ...prev,
        filters: { ...prev.filters, [examId]: filters },
        expanded: { ...prev.expanded, [examId]: false } // Reset expanded state on filter change
      }));
    }, []);

  const setExamsWiseCutoff = useCallback((
    setter: SetStateAction<Record<number, Record<string, Record<number, number | null>>>>
  ) => {
    setExamData(prev => ({
      ...prev,
      cutoffs: typeof setter === 'function' ? setter(prev.cutoffs) : setter
    }));
  }, []);

  const handleViewMore = useCallback(async (examId: number) => {
    const page = (examData.pages[examId] || 1) + 1;
    const filters = examData.filters[examId] || {};
    
    const queryParams = new URLSearchParams({
      exam_id: examId.toString(),
      page: page.toString(),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => [`${key.toLowerCase()}_section`, value!])
      )
    });

    try {
      const response = await getCollegeFilteredCutoffs(collegeId, queryParams.toString());
      const newCutoffs = response.cutoffs.reduce((acc: any, cutoff: any) => ({
        ...acc,
        [cutoff.course_full_name]: cutoff.ranks
      }), {});

      setExamData(prev => ({
        ...prev,
        cutoffs: {
          ...prev.cutoffs,
          [examId]: { ...prev.cutoffs[examId], ...newCutoffs }
        },
        pages: { ...prev.pages, [examId]: page },
        hasMore: { ...prev.hasMore, [examId]: response.cutoffs.length >= 5 }
      }));
    } catch (error) {
      console.error("Error fetching cutoffs:", error);
      setExamData(prev => ({
        ...prev,
        hasMore: { ...prev.hasMore, [examId]: false }
      }));
    }
  }, [collegeId, examData]);

  const resetPage = useCallback((examId: number) => {
    setExamData(prev => ({
      ...prev,
      pages: { ...prev.pages, [examId]: 1 },
      hasMore: { ...prev.hasMore, [examId]: true },
      expanded: { ...prev.expanded, [examId]: false } // Reset expanded state on page reset
    }));
  }, []);

  const toggleExpand = useCallback((examId: number) => {
    setExamData(prev => ({
      ...prev,
      expanded: { ...prev.expanded, [examId]: !prev.expanded[examId] }
    }));
  }, []);

  if (!data?.length) return <p className="text-gray-600">No exam data available.</p>;

  return (
    <div className="space-y-8">
      {data.map(exam => {
        const cutoffs = examData.cutoffs[exam.exam_id] || {};
        const years = getUniqueYears(exam.cutoffs || []);
        const courseCount = Object.keys(cutoffs).length;
        const cutoffEntries = Object.entries(cutoffs);
        const isExpanded = examData.expanded[exam.exam_id] || false;
        const visibleCutoffs = isExpanded ? cutoffEntries : cutoffEntries.slice(0, ROWS_PER_PAGE);

        if (!courseCount && !exam.cutoffs?.length) return null;

        return (
          <div key={exam.exam_id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800">
                {exam.exam_name}
                <span className="text-primary-main"> Cut-Offs</span>
              </h2>
            </div>

            <div className="p-6">
              <CutoffFilterSection
                examId={exam.exam_id}
                collegeId={collegeId}
                defaultFilters={exam.default_filters}
                filterData={exam.filters}
                onFiltersChange={handleFiltersChange(exam.exam_id)}
                setExamsWiseCutoff={setExamsWiseCutoff as Dispatch<SetStateAction<Record<number, Record<string, Record<number, number | null>>>>>}
                onResetPage={() => resetPage(exam.exam_id)}
              />

              {courseCount === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  <span className="text-red-500 text-lg">✗</span> No data found. Adjust filters to see results.
                </p>
              ) : (
                <div className="overflow-x-auto mt-6">
                  <table className="w-full course-table shadow-course">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="px-4 py-3 text-left">Course Name</th>
                        {years.map(year => (
                          <th key={year} className="px-4 py-3 text-center">{year}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCutoffs.map(([course, ranks]) => (
                        <tr key={course} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-700">{course}</td>
                          {years.map(year => (
                            <td key={year} className="px-4 py-3 text-center text-gray-600">
                              {ranks[year] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {courseCount > ROWS_PER_PAGE && (
                    <button
                      onClick={() => toggleExpand(exam.exam_id)}
                      className="mt-6 ml-auto flex items-center gap-2 bg-black text-white text-xsm font-medium font-public px-2.5 py-0.5 rounded-full hover:bg-primary-main transition-all duration-200"
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                        </>
                      ) : (
                        <>
                          Show More
                        </>
                      )}
                    </button>
                  )}

                
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

CutoffTable.displayName = 'CutoffTable';
export default CutoffTable;