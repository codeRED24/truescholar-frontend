import { Metadata } from "next";
import { getColleges } from "@/api/list/getColleges";
import { getStreams, StreamProps } from "@/api/list/getStreams";
import { getCities } from "@/api/list/getCities";
import { getStates, StateDto } from "@/api/list/getStates";
import { HomeCity } from "@/api/@types/header-footer";
import { CollegeDTO } from "@/api/@types/college-list";
import { generatePageMetadata, generatePageSchema, JsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo";
import { buildFilterBreadcrumbTrail } from "@/lib/seo/linking/breadcrumbs";
import CollegeFilterClient from "@/components/page/college/CollegeFilterClient";

export const revalidate = 86400; // 24 hours (revalidationTimes.filter)

interface PageProps {
  params: Promise<{ params?: string[] }>;
}

/**
 * Parse URL params to extract filter IDs and names
 */
async function parseUrlParams(paramArray: string[] = []) {
  // Fetch lookup data
  const [streamsData, citiesData, statesData] = await Promise.all([
    getStreams(),
    getCities(),
    getStates(),
  ]);

  // Build lookup maps
  const formatName = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const streamBySlug = new Map<string, StreamProps>();
  streamsData.forEach((s) => streamBySlug.set(formatName(s.stream_name), s));

  const cityBySlug = new Map<string, HomeCity>();
  citiesData.forEach((c) => cityBySlug.set(formatName(c.city_name), c));

  const stateBySlug = new Map<string, StateDto>();
  statesData.forEach((s) => stateBySlug.set(formatName(s.name), s));

  // Parse the URL params
  let stream: { id: number; name: string } | undefined;
  let city: { id: number; name: string } | undefined;
  let state: { id: number; name: string } | undefined;

  const joinedParams = paramArray.join("-").toLowerCase();

  // Pattern: [stream]-colleges-in-[location]
  // Examples: engineering-colleges-in-delhi, colleges-in-maharashtra

  if (joinedParams.includes("colleges")) {
    const collegesIndex = joinedParams.indexOf("colleges");

    // Extract stream (before "colleges")
    if (collegesIndex > 0) {
      const streamPart = joinedParams.slice(0, collegesIndex).replace(/-$/, "");
      const matchedStream = streamBySlug.get(streamPart);
      if (matchedStream) {
        stream = {
          id: matchedStream.stream_id,
          name: matchedStream.stream_name,
        };
      }
    }

    // Extract location (after "colleges-in-")
    const inIndex = joinedParams.indexOf("-in-", collegesIndex);
    if (inIndex !== -1) {
      const locationPart = joinedParams.slice(inIndex + 4);

      // Check if it's a city
      const matchedCity = cityBySlug.get(locationPart);
      if (matchedCity) {
        city = { id: matchedCity.city_id, name: matchedCity.city_name };
      } else {
        // Check if it's a state
        const matchedState = stateBySlug.get(locationPart);
        if (matchedState) {
          state = { id: matchedState.state_id, name: matchedState.name };
        }
      }
    }
  }

  return { stream, city, state, streamsData, citiesData, statesData };
}

/**
 * Build page title from filters
 */
function buildTitle(
  stream?: { name: string },
  city?: { name: string },
  state?: { name: string },
): string {
  const parts: string[] = [];

  if (stream) {
    parts.push(`${stream.name} Colleges`);
  } else {
    parts.push("Colleges");
  }

  if (city) {
    parts.push(`in ${city.name}`);
  } else if (state) {
    parts.push(`in ${state.name}`);
  }

  return parts.join(" ");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const paramArray = resolvedParams.params || [];

  try {
    const { stream, city, state } = await parseUrlParams(paramArray);

    return generatePageMetadata({
      type: "filter",
      data: {
        entityType: "college",
        stream,
        city,
        state,
        resultCount: 0, // Will be updated on client
      },
    });
  } catch {
    return {
      title: "Colleges in India | TrueScholar",
      description:
        "Explore top colleges in India. Compare courses, fees, and placements.",
    };
  }
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const paramArray = resolvedParams.params || [];

  let stream: { id: number; name: string } | undefined;
  let city: { id: number; name: string } | undefined;
  let state: { id: number; name: string } | undefined;
  let initialColleges: CollegeDTO[] = [];
  let totalCount = 0;

  try {
    const parsed = await parseUrlParams(paramArray);
    stream = parsed.stream;
    city = parsed.city;
    state = parsed.state;

    // Fetch initial colleges (page 1) on server
    const collegesData = await getColleges({
      page: 1,
      limit: 10,
      filters: {
        stream_name: stream?.name || "",
        city_name: city?.name || "",
        state_name: state?.name || "",
      },
    });

    initialColleges = collegesData.colleges;
    totalCount = collegesData.total_colleges_count;
  } catch (error) {
    console.error("Error fetching initial colleges:", error);
    // Continue with empty data - client will show error or refetch
  }

  const title = buildTitle(stream, city, state);

  // Generate schema
  const schema = generatePageSchema({
    type: "filter",
    entityType: "college",
    stream: stream?.name,
    city: city?.name,
    state: state?.name,
    resultCount: totalCount,
  });

  // Build breadcrumbs
  const breadcrumbItems = buildFilterBreadcrumbTrail("colleges", {
    stream: stream
      ? {
          name: stream.name,
          slug: stream.name.toLowerCase().replace(/\s+/g, "-"),
        }
      : undefined,
    city: city
      ? { name: city.name, slug: city.name.toLowerCase().replace(/\s+/g, "-") }
      : undefined,
    state: state
      ? {
          name: state.name,
          slug: state.name.toLowerCase().replace(/\s+/g, "-"),
        }
      : undefined,
  });

  return (
    <>
      <JsonLd data={schema} id="college-filter-schema" />
      <div className="container-body pt-4">
        <Breadcrumbs items={breadcrumbItems} showSchema={false} />
      </div>
      <CollegeFilterClient
        initialColleges={initialColleges}
        initialTotalCount={totalCount}
        title={title}
        filters={{
          stream_name: stream?.name,
          city_name: city?.name,
          state_name: state?.name,
        }}
      />
    </>
  );
}
