"use client";

import { CollegesResponseDTO } from "@/api/@types/college-list";
import { getColleges } from "@/api/list/getColleges";
import { getStreams } from "@/api/list/getStreams";
import { getStates, StateDto } from "@/api/list/getStates";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { getCities } from "@/api/list/getCities";
import { HomeCity, HomeStream } from "@/api/@types/header-footer";

const CollegeListCard = dynamic(
  () => import("@/components/cards/CollegeListCard"),
  {
    loading: () => (
      <div className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32" />
    ),
    ssr: false,
  }
);

type CollegeListItemProps = {
  college: CollegesResponseDTO["colleges"][0];
  isLast: boolean;
  lastCollegeRef: (node: HTMLDivElement | null) => void;
};

const CollegeListItem = React.memo(
  ({ college, isLast, lastCollegeRef }: CollegeListItemProps) => (
    <div ref={isLast ? lastCollegeRef : null}>
      <CollegeListCard college={college} />
    </div>
  )
);
CollegeListItem.displayName = "CollegeListItem";

const DynamicCollegeList = () => {
  const params = useParams();

  const [streamMap, setStreamMap] = useState<Record<string, string>>({});
  const [cityMap, setCityMap] = useState<Record<string, string>>({});
  const [stateMap, setStateMap] = useState<Record<string, string>>({});
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [initialDataError, setInitialDataError] = useState<string | null>(null);

  const formatName = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const streamNameToId = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(streamMap).map(([id, name]) => [formatName(name), id])
      ),
    [streamMap]
  );
  const cityNameToId = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(cityMap).map(([id, name]) => [formatName(name), id])
      ),
    [cityMap]
  );
  const stateNameToId = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(stateMap).map(([id, name]) => [formatName(name), id])
      ),
    [stateMap]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitialData(true);
      try {
        const [streamsData, citiesData, statesData] = await Promise.all([
          getStreams(),
          getCities(),
          getStates(),
        ]);

        setStreamMap(
          Object.fromEntries(
            streamsData.map((item: HomeStream) => [
              String(item.stream_id),
              item.stream_name,
            ])
          )
        );
        setCityMap(
          Object.fromEntries(
            citiesData.map((item: HomeCity) => [
              String(item.city_id),
              item.city_name,
            ])
          )
        );
        setStateMap(
          Object.fromEntries(
            statesData.map(
              (item: StateDto & { state_id: number; name: string }) => [
                String(item.state_id),
                item.name,
              ]
            )
          )
        );
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        setInitialDataError(
          err instanceof Error ? err.message : "Failed to load initial data"
        );
      } finally {
        setLoadingInitialData(false);
      }
    };
    fetchInitialData();
  }, []);

  const parseParams = (params: { params?: string[] }) => {
    const paramArray = params.params || [];
    let stream_id = "";
    let city_id = "";
    let state_id = "";

    const joinedParams = paramArray.join("-").toLowerCase();
    const parts = joinedParams.split("-");

    console.log("Joined params:", joinedParams);
    console.log("Parts:", parts);

    if (joinedParams.startsWith("college-")) {
      const cleanParts = joinedParams.replace("college-", "").split("-");
      console.log("Clean parts (college-):", cleanParts);

      if (cleanParts.includes("colleges")) {
        const collegesIndex = cleanParts.indexOf("colleges");
        if (collegesIndex > 0) {
          const stream = cleanParts.slice(0, collegesIndex).join("-");
          stream_id = streamNameToId[stream] || stream;
          console.log("Stream detected:", stream_id);
        }
        if (collegesIndex < cleanParts.length - 1) {
          const afterColleges = cleanParts.slice(collegesIndex + 1).join("-");
          console.log("After colleges:", afterColleges);

          if (afterColleges.startsWith("in-")) {
            const location = afterColleges.replace("in-", "");
            console.log("Location:", location);

            if (cityNameToId[location]) {
              city_id = cityNameToId[location];
              console.log("City ID from cityNameToId:", city_id);
            } else if (stateNameToId[location]) {
              state_id = stateNameToId[location];
              console.log("State ID from stateNameToId:", state_id);
            } else if (!isNaN(Number(location))) {
              if (location.length === 2) {
                state_id = location;
                console.log("2-char State ID:", state_id);
              } else if (location.length === 6) {
                city_id = location;
                console.log("6-char City ID:", city_id);
              } else if (cityMap[location]) city_id = location;
              else if (stateMap[location]) state_id = location;
              else if (streamMap[location]) stream_id = location;
            } else {
              if (stream_id && location !== stream_id) city_id = location;
              else state_id = location;
              console.log("Fallback - City/State:", city_id, state_id);
            }
          }
        }
      }
    } else if (parts.includes("colleges")) {
      const collegesIndex = parts.indexOf("colleges");
      console.log("Colleges index:", collegesIndex);

      if (collegesIndex > 0) {
        const stream = parts.slice(0, collegesIndex).join("-");
        stream_id = streamNameToId[stream] || stream;
        console.log("Stream detected:", stream_id);
      }
      if (collegesIndex < parts.length - 1) {
        const afterColleges = parts.slice(collegesIndex + 1).join("-");
        console.log("After colleges:", afterColleges);

        if (afterColleges.startsWith("in-")) {
          const location = afterColleges.replace("in-", "");
          console.log("Location:", location);

          if (cityNameToId[location]) {
            city_id = cityNameToId[location];
            console.log("City ID from cityNameToId:", city_id);
          } else if (stateNameToId[location]) {
            state_id = stateNameToId[location];
            console.log("State ID from stateNameToId:", state_id);
          } else if (!isNaN(Number(location))) {
            if (location.length === 2) {
              state_id = location;
              console.log("2-char State ID:", state_id);
            } else if (location.length === 6) {
              city_id = location;
              console.log("6-char City ID:", city_id);
            } else if (cityMap[location]) city_id = location;
            else if (stateMap[location]) state_id = location;
            else if (streamMap[location] && !stream_id) stream_id = location;
          } else {
            if (stream_id && location !== stream_id) city_id = location;
            else state_id = location;
            console.log("Fallback - City/State:", city_id, state_id);
          }
        }
      }
    }

    console.log("Final result:", { stream_id, city_id, state_id });
    return { stream_id, city_id, state_id };
  };

  const {
    stream_id: initialStreamId,
    city_id: initialCityId,
    state_id: initialStateId,
  } = parseParams(params);

  const [collegesData, setCollegesData] = useState<
    CollegesResponseDTO["colleges"]
  >([]);
  const [totalCollegesCount, setTotalCollegesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({
    city_id: initialCityId,
    state_id: initialStateId,
    stream_id: initialStreamId,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastCollegeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchColleges = useCallback(async () => {
    if (!hasMore || loadingInitialData) return;

    setLoading(true);
    try {
      const data = await getColleges({
        page,
        limit: 10,
        filters: {
          city_id: filters.city_id,
          state_id: filters.state_id,
          stream_id: filters.stream_id,
        },
      });
      setTotalCollegesCount(data.total_colleges_count);
      setCollegesData((prev) => [...prev, ...data.colleges]);
      setHasMore(data.colleges.length === 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load colleges");
    } finally {
      setLoading(false);
    }
  }, [page, filters, hasMore, loadingInitialData]);

  useEffect(() => {
    fetchColleges();
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [fetchColleges]);

  const getTitle = () => {
    const streamName = streamMap[filters.stream_id] || filters.stream_id || "";
    const cityName = cityMap[filters.city_id] || filters.city_id || "";
    const stateName = stateMap[filters.state_id] || filters.state_id || "";

    let titleParts: string[] = [];
    if (streamName) titleParts.push(`${streamName} Colleges`);
    else titleParts.push("Colleges");
    if (cityName) titleParts.push(`in ${cityName}`);
    else if (stateName) titleParts.push(`in ${stateName}`);

    return titleParts.join(" ");
  };

  if (loadingInitialData) {
    return (
      <div className="md:py-14 container-body">
        <div className="text-center">Loading initial data...</div>
      </div>
    );
  }

  if (initialDataError) {
    return (
      <div className="md:py-14 container-body">
        <div className="text-center text-red-500">{initialDataError}</div>
      </div>
    );
  }

  return (
    <div className="md:py-14 container-body">
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-4 md:mb-2 capitalize">
            {getTitle()} ({collegesData.length}/{totalCollegesCount})
          </h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="md:grid grid-cols-2 gap-4 space-y-4 md:space-y-0">
            {collegesData.map((college, index) => (
              <CollegeListItem
                key={college.college_id}
                college={college}
                isLast={index === collegesData.length - 1}
                lastCollegeRef={lastCollegeRef}
              />
            ))}
            {loading &&
              Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`loading-${i}`}
                  className="animate-pulse p-4 bg-gray-200 rounded-2xl h-32"
                />
              ))}
            {!loading && collegesData.length === 0 && (
              <div className="text-center text-gray-500 col-span-2">
                No colleges found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return <DynamicCollegeList />;
}
