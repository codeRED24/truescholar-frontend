const getValuesBetweenKeywords = (
  startIndex: number,
  words: string[],
  keywords: string[]
): string[] => {
  const values: string[] = [];
  for (let j = startIndex + 1; j < words.length; j++) {
    if (keywords.includes(words[j])) break;
    values.push(words[j]);
  }
  return values;
};

const parseMultiValues = (value: string): string[] =>
  value
    .split(/[,%2C]/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

export function buildCollegeSlug(filters: {
  city?: string[];
  state?: string[];
  stream?: string[];
  course_group?: string[];
  type?: string[];
  fee_range?: string[];
}) {
  const parts = ["colleges"];

  if (filters.city && filters.city.length > 0) {
    const cityValues = Array.from(
      new Set(
        filters.city.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("city", cityValues.join("%2C"));
  }

  if (filters.state && filters.state.length > 0) {
    const stateValues = Array.from(
      new Set(
        filters.state.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("state", stateValues.join("%2C"));
  }

  if (filters.stream && filters.stream.length > 0) {
    const streamValues = Array.from(
      new Set(
        filters.stream.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("stream", streamValues.join("%2C"));
  }

  if (filters.course_group && filters.course_group.length > 0) {
    const courseGroupValues = Array.from(
      new Set(
        filters.course_group.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("for", courseGroupValues.join("%2C"));
  }

  if (filters.type && filters.type.length > 0) {
    const typeValues = Array.from(
      new Set(
        filters.type.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("type", typeValues.join("%2C"));
  }

  if (filters.fee_range && filters.fee_range.length > 0) {
    const feeRangeValues = Array.from(
      new Set(
        filters.fee_range.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("fee_range", feeRangeValues.join("%2C"));
  }

  // console.log({ parts });

  return `/${parts.join("-")}`;
}

export function parseCollegeSlugToFilters(slug: string) {
  const filters: {
    city?: string[];
    state?: string[];
    stream?: string[];
    course_group?: string[];
    type?: string[];
    fee_range?: string[];
  } = {};

  // Remove leading slash and decode URL-encoded characters
  const cleanSlug = decodeURIComponent(slug.replace(/^\//, ""));
  const parts = cleanSlug.split("-");

  // Find the starting index after "colleges"
  const collegesIndex = parts.indexOf("colleges");
  if (collegesIndex === -1) return filters;

  // Define valid keywords
  const keywords = ["city", "state", "stream", "for", "type", "fee_range"];

  // Parse the parts after "colleges"
  let i = collegesIndex + 1;
  while (i < parts.length) {
    const keyword = parts[i];

    if (!keywords.includes(keyword)) {
      i++;
      continue;
    }

    // Collect all parts until the next keyword
    const valueParts: string[] = [];
    let j = i + 1;
    while (j < parts.length && !keywords.includes(parts[j])) {
      valueParts.push(parts[j]);
      j++;
    }

    // Join the value parts back together with hyphens
    const valueString = valueParts.join("-");

    // Split by URL-encoded comma (%2C) or regular comma for multiple values
    const valueArray = valueString
      .split(/[,%2C]/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    switch (keyword) {
      case "city":
        filters.city = valueArray;
        break;
      case "state":
        filters.state = valueArray;
        break;
      case "stream":
        filters.stream = valueArray;
        break;
      case "for":
        filters.course_group = valueArray;
        break;
      case "type":
        filters.type = valueArray;
        break;
      case "fee_range":
        filters.fee_range = valueArray;
        break;
    }

    i = j;
  }

  // console.log({ filters });

  return filters;
}

export function parseExamSlugToFilters(slug: string) {
  const filters: {
    streams: string[];
    level: string[];
    mode: string[];
  } = {
    streams: [],
    level: [],
    mode: [],
  };

  // Decode URL-encoded characters first
  const decodedSlug = decodeURIComponent(slug);

  const words = decodedSlug.split("-");

  const keywords = ["exams", "level", "stream", "mode"];

  for (let i = 0; i < words.length; i++) {
    if (words[i] === "level") {
      const levelWords = getValuesBetweenKeywords(i, words, keywords);
      if (levelWords.length > 0) {
        filters.level = parseMultiValues(levelWords.join("-"));
      }
    }

    if (words[i] === "stream") {
      const streamWords = getValuesBetweenKeywords(i, words, keywords);
      if (streamWords.length > 0) {
        const joinedStreamWords = streamWords.join("-");
        filters.streams = parseMultiValues(joinedStreamWords);
      }
    }

    if (words[i] === "mode") {
      const modeWords = getValuesBetweenKeywords(i, words, keywords);
      if (modeWords.length > 0) {
        const joinedModeWords = modeWords.join("-");
        filters.mode = parseMultiValues(joinedModeWords);
      }
    }
  }

  return filters;
}

export function buildExamSlug(filters: {
  level?: string[];
  streams?: string[];
  mode?: string[];
}) {
  const parts = ["exams"];

  if (filters.level && filters.level.length > 0) {
    const levelValues = Array.from(
      new Set(
        filters.level.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("level", levelValues.join("%2C"));
  }

  if (filters.streams && filters.streams.length > 0) {
    const streamValues = Array.from(
      new Set(
        filters.streams.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("stream", streamValues.join("%2C"));
  }

  if (filters.mode && filters.mode.length > 0) {
    const modeValues = Array.from(
      new Set(
        filters.mode.map((v) =>
          v
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        )
      )
    );
    parts.push("mode", modeValues.join("%2C"));
  }

  return `/${parts.join("-")}`;
}
