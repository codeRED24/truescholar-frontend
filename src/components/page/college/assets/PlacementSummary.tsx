"use client"
import dynamic from "next/dynamic";
import Image from "next/image";
import { memo, useMemo } from "react";
import { formatTuitionFee } from "@/components/utils/utils";
import { cn } from "@/lib/utils";

const Tabs = dynamic(() => import("@/components/ui/tabs").then((mod) => mod.Tabs));
const TabsContent = dynamic(() => import("@/components/ui/tabs").then((mod) => mod.TabsContent));
const TabsList = dynamic(() => import("@/components/ui/tabs").then((mod) => mod.TabsList));
const TabsTrigger = dynamic(() => import("@/components/ui/tabs").then((mod) => mod.TabsTrigger));

interface PlacementData {
  year: number;
  highest_package: number;
  avg_package: number;
  median_package: number;
  placement_percentage: number;
  top_recruiters: string;
  description?: string;
}

interface PlacementSummaryProps {
  data: PlacementData[];
}

const StatCard = memo(({ src, alt, label, value }: { src: string; alt: string; label: string; value: string | number }) => (
  <div className="flex gap-2 items-center">
    <Image src={src} height={45} width={45} alt={alt} loading="lazy" />
    <div>
      <label className="block text-[#919EAB] text-xs">{label}</label>
      <p className="font-semibold text-white text-sm">{value || "-"}</p>
    </div>
  </div>
));
StatCard.displayName = "StatCard";

const PlacementSummary: React.FC<PlacementSummaryProps> = memo(({ data }) => {
  const sortedData = useMemo(() => [...(data || [])].sort((a, b) => b.year - a.year), [data]);

  const tabTriggers = useMemo(() => {
    if (!sortedData.length) return null;
    return sortedData.map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === sortedData.length - 1;
      return (
        <TabsTrigger
          key={item.year}
          value={`year-${item.year}`}
          className={cn(
            "transition-all duration-300 ease-in-out",
            "data-[state=active]:rounded-2xl data-[state=active]:rounded-b-none rounded-none font-normal data-[state=active]:font-semibold data-[state=active]:h-11 data-[state=active]:-translate-y-1.5",
            "text-[#637381] data-[state=active]:text-white border border-b-0 border-[#919EAB] data-[state=active]:border-[#1C252E] bg-white data-[state=active]:bg-[#1C252E]",
            isFirst && "rounded-tl-2xl",
            isLast && "rounded-tr-2xl"
          )}
        >
          {item.year}
        </TabsTrigger>
      );
    });
  }, [sortedData]);

  const tabContents = useMemo(() => {
    if (!sortedData.length) return null;
    return sortedData.map((item) => (
      <TabsContent key={item.year} value={`year-${item.year}`} className="mt-[1px]">
        <div className="grid md:grid-cols-4 gap-4 p-6 border border-[#1C252E] rounded-2xl rounded-tl-none bg-[#1C252E]">
          <StatCard
            src="/img/group.webp"
            alt="Placement Percentage"
            label="Students Placed"
            value={item.placement_percentage > 0 ? `${item.placement_percentage}%` : "-"}
          />
          <StatCard
            src="/img/saving.webp"
            alt="Average Package"
            label="Average Package"
            value={item.avg_package > 0 ? formatTuitionFee(item.avg_package) : "-"}
          />
          <StatCard
            src="/img/money.webp"
            alt="Highest Package"
            label="Highest Package"
            value={item.highest_package > 0 ? formatTuitionFee(item.highest_package) : "-"}
          />
          <StatCard
            src="/img/building.webp"
            alt="Top Recruiters"
            label="No. of Companies Visited"
            value={item.top_recruiters?.length > 0 ? item.top_recruiters.split(",").length : "-"}
          />
        </div>
      </TabsContent>
    ));
  }, [sortedData]);

  if (!sortedData.length) {
    return <p>No placement data available.</p>;
  }

  return (
    <>
      <h3 className="font-medium text-primary-3 text-md md:text-lg mt-8 mb-4">Placement Highlights</h3>
      <Tabs defaultValue={`year-${sortedData[0]?.year}`} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-transparent p-0">
          {tabTriggers}
        </TabsList>
        {tabContents}
      </Tabs>
    </>
  );
});

PlacementSummary.displayName = "PlacementSummary";

export default PlacementSummary;