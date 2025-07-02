"use client";

import React, { memo, useMemo } from "react";
import Image from "next/image";

// Define interfaces for type safety
interface Ranking {
  rank: number;
  year: number;
  agency: string | null;
  rank_title: string;
  rank_subtitle: string | null;
  reference_url: string;
  stream_name: string;
  course_group_id: number;
  agency_logo: string | null;
  ranking_agency_short_name: string;
}

interface YearRankings {
  year: number;
  rankings: Ranking[];
}

interface CollegeRankingTableProps {
  clgName?: string;
  data: {
    content: unknown[];
    grouped_by_year: YearRankings[];
  } | null;
}

const groupByAgencyAcrossYears = (data: YearRankings[]): Record<string, Ranking[]> => {
  return data
    .flatMap(({ year, rankings }) =>
      rankings.map((ranking) => ({ ...ranking, year }))
    )
    .reduce((acc: Record<string, Ranking[]>, ranking) => {
      const agency = ranking.agency || "Unknown Agency";
      acc[agency] = acc[agency] || [];
      acc[agency].push(ranking);
      return acc;
    }, {});
};

const RankingRow = memo(({ ranking }: { ranking: Ranking }) => (
  <tr key={`${ranking.year}-${ranking.rank_title}-${ranking.rank}`}>
    <td>{ranking.year}</td>
    <td>{`${ranking.ranking_agency_short_name}-${ranking.year}` || ranking.rank_title}</td>
    <td className="font-medium flex items-center gap-1">
      #<span>{ranking.rank}</span>
      {ranking.rank <= 3 && (
        <span className="text-[17px]">
          {ranking.rank === 1 ? "🥇" : ranking.rank === 2 ? "🥈" : "🥉"}
        </span>
      )}
    </td>
    <td>{ranking.stream_name}</td>
  </tr>
));
RankingRow.displayName = "RankingRow";

const CollegeRankingTable: React.FC<CollegeRankingTableProps> = memo(({ data, clgName }) => {
  if (!data?.grouped_by_year?.length) return null;
  const rankingsByAgency = useMemo(() => groupByAgencyAcrossYears(data.grouped_by_year), [data]);

  return (
    <div className="space-y-6">
      {Object.entries(rankingsByAgency).map(([agency, agencyRankings]) => {
        const { agency_logo, ranking_agency_short_name } = agencyRankings[0];

        return (
          <div key={agency} className="agency-section article-content-body">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {agency_logo && (
                  <Image
                    src={agency_logo}
                    height={48}
                    width={48}
                    alt={`${agency} logo`}
                    className="w-12 h-12 object-contain"
                    loading="lazy"
                  />
                )}
                <h6 className="text-sm text-gray-7 font-semibold">
                  {ranking_agency_short_name || "Unknown Agency"}
                </h6>
              </div>
              {/* <DownloadButton
                downloadId={`pdf-table-${ranking_agency_short_name}`}
                label="Download"
                collegeName={clgName || "unknown"}
                type="ranking"
              /> */}
            </div>
            <div
              className="table-container-ranking overflow-x-auto"
              id={`pdf-table-${ranking_agency_short_name || "unknown"}`}
            >
              <table className="bg-white w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Year</th>
                    <th className="p-2">Rank Title</th>
                    <th className="p-2">Rank</th>
                    <th className="p-2">Stream</th>
                  </tr>
                </thead>
                <tbody>
                  {agencyRankings.map((ranking) => (
                    <RankingRow key={`${ranking.year}-${ranking.rank}`} ranking={ranking} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
});

CollegeRankingTable.displayName = "CollegeRankingTable";
export default CollegeRankingTable;