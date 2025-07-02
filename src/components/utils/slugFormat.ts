export function buildCollegeSlug(filters: {
  statename?: string;
  coursename?: string;
  streamname?: string;
  min_fees?: number;
  max_fees?: number;
  searchquery?: string;
}) {
  const parts = ["universities"];

  if (filters.statename)
    parts.push(
      "state",
      ...filters.statename
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/g, ""))
    );
  if (filters.coursename)
    parts.push(
      "for",
      ...filters.coursename
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/g, ""))
    );
  if (filters.streamname)
    parts.push(
      "stream",
      ...filters.streamname
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/g, ""))
    );

  if (filters.min_fees && filters.max_fees) {
    parts.push(
      "with",
      "fees",
      "between",
      `${filters.min_fees / 100000}l`,
      "and",
      `${filters.max_fees / 100000}l`
    );
  } else if (filters.min_fees) {
    parts.push("with", "fees", "from", `${filters.min_fees}k`);
  } else if (filters.max_fees) {
    parts.push("with", "fees", "upto", `${filters.max_fees}k`);
  }

  if (filters.searchquery) {
    parts.push(
      "search",
      ...filters.searchquery
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/g, ""))
    );
  }

  return `/university/${parts.join("-")}`;
}

export function parseSlugToFilters(slug: string) {
  const filters: Record<string, string | number> = {};
  const words = slug.split("-");

  // Define keywords that can appear in the slug
  const keywords = [
    "colleges",
    "state",
    "for",
    "stream",
    "with",
    "fees",
    "between",
    "and",
    "from",
    "upto",
    "search",
  ];

  const getValuesBetweenKeywords = (startIndex: number): string[] => {
    const values: string[] = [];
    for (let j = startIndex + 1; j < words.length; j++) {
      if (keywords.includes(words[j])) {
        break;
      }
      values.push(words[j]);
    }
    return values;
  };

  for (let i = 0; i < words.length; i++) {
    if (words[i] === "state") {
      const stateWords = getValuesBetweenKeywords(i);
      if (stateWords.length > 0) {
        filters.statename = stateWords.join("-");
      }
    }
    if (words[i] === "for") {
      const courseWords = getValuesBetweenKeywords(i);
      if (courseWords.length > 0) {
        filters.coursename = courseWords.join("-");
      }
    }
    if (words[i] === "stream") {
      const streamWords = getValuesBetweenKeywords(i);
      if (streamWords.length > 0) {
        filters.streamname = streamWords.join("-");
      }
    }
    if (words[i] === "search") {
      const searchWords = getValuesBetweenKeywords(i);
      if (searchWords.length > 0) {
        filters.searchquery = searchWords.join("-");
      }
    }
    if (words[i] === "with" && words[i + 1] === "fees") {
      if (words[i + 2] === "between") {
        const minMatch = words[i + 3];
        const maxMatch = words[i + 5];
        if (minMatch?.endsWith("k") && maxMatch?.endsWith("k")) {
          filters.min_fees = parseInt(minMatch.replace("k", ""));
          filters.max_fees = parseInt(maxMatch.replace("k", ""));
        }
      } else if (words[i + 2] === "from") {
        const minMatch = words[i + 3];
        if (minMatch?.endsWith("k")) {
          filters.min_fees = parseInt(minMatch.replace("k", ""));
        }
      } else if (words[i + 2] === "upto") {
        const maxMatch = words[i + 3];
        if (maxMatch?.endsWith("k")) {
          filters.max_fees = parseInt(maxMatch.replace("k", ""));
        }
      }
    }
  }

  return filters;
}
