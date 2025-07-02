"use client";

import { memo, useMemo } from "react";
import dynamic from "next/dynamic";

const SkeletonBarGraph = () => (
  <div className="w-full py-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>{" "}
    <div className="h-80 w-full">
      <div className="flex justify-between mb-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
            <span className="w-20 h-3 bg-gray-200 rounded"></span>
          </div>
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded flex justify-between items-end gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-3/4 bg-gray-200 rounded"></div>
            <span className="w-8 h-3 bg-gray-200 rounded"></span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
  loading: () => <SkeletonBarGraph />,
});

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PlacementData {
  year: number;
  highest_package: number;
  avg_package: number;
  median_package: number;
  placement_percentage: number;
  top_recruiters: string;
}

interface PlacementBarGraphProps {
  data: PlacementData[];
}

const formatNumber = (num: number): string => {
  if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(2)} L`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)} K`;
  return num.toString();
};

const PlacementBarGraph: React.FC<PlacementBarGraphProps> = memo(({ data }) => {
  if (!data?.length) {
    return null;
  }

  const maxValue = useMemo(() => {
    return Math.max(
      ...data.flatMap((item) => [
        item.highest_package,
        item.avg_package,
        item.median_package,
      ]),
      1
    );
  }, [data]);

  const chartData = useMemo(
    () => ({
      labels: data.map((item) => item.year.toString()),
      datasets: [
        {
          label: "Highest Package",
          data: data.map((item) => item.highest_package),
          backgroundColor: "#00B8D9",
          borderRadius: 5,
        },
        {
          label: "Average Package",
          data: data.map((item) => item.avg_package),
          backgroundColor: "#FFAB00",
          borderRadius: 5,
        },
        {
          label: "Median Package",
          data: data.map((item) => item.median_package),
          backgroundColor: "#00A76F",
          borderRadius: 5,
        },
      ],
    }),
    [data]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => formatNumber(value),
          },
        },
      },
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            label: (context: any) =>
              `${context.dataset.label}: ${formatNumber(context.raw)}`,
          },
        },
      },
      animation: {
        duration: 800,
      },
    }),
    []
  );

  return (
    <div className="w-full py-6">
      <h3 className="text-xl font-semibold text-primary-3 text-center my-4">
        Year-wise Graphical Insights
      </h3>
      <div className="h-80 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
});

PlacementBarGraph.displayName = "PlacementBarGraph";
export default PlacementBarGraph;
