/**
 * Get the current URL in the browser.
 */
export const getCurrentUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return "";
};

/**
 * Get the current geolocation (latitude and longitude).
 */
export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      });
    }
  });
};

/**
 * Calculate the days ago from a given publication date.
 */
export const calculateDaysAgo = (publicationDate?: string | Date): string => {
  if (!publicationDate) {
    return "1 day ago";
  }

  const publishedDate = new Date(publicationDate);

  if (isNaN(publishedDate.getTime())) {
    return "N/A";
  }

  const currentDate = new Date();

  currentDate.setHours(0, 0, 0, 0);
  publishedDate.setHours(0, 0, 0, 0);

  const timeDifference = currentDate.getTime() - publishedDate.getTime();
  const daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (daysAgo === 0) {
    return "Today";
  } else if (daysAgo === 1) {
    return "1 day ago";
  } else {
    return `${daysAgo} days ago`;
  }
};

export const formatDateYearMonth = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

/**
 * Trim text to a specific length and add ellipsis if necessary.
 */
export const trimText = (text: string, maxLength: number): string => {
  if (typeof text === "string" && text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

/**
 * Normalize the string (convert to lowercase and remove non-alphanumeric characters).
 */
export const normalize = (str: string): string => {
  return str.toLowerCase().replace(/[\W_]+/g, "");
};

/**
 * Get a random fallback image from a given array of images.
 */
export const getRandomFallbackImage = (images: string[]): string => {
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("No valid fallback images provided");
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

/**
 * Format silos (e.g., convert underscores to spaces and capitalize each word).
 */
export const formatSilos = (silos: string) => {
  return silos
    .replace(/_/g, " ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Format tuition fee (₹) into a human-readable format.
 */
export const formatTuitionFee = (fee: number | null | undefined) => {
  if (fee == null || fee === 0) return "-";
  if (fee >= 10000000) {
    const formattedFee = fee / 10000000;
    return formattedFee % 1 === 0
      ? `₹ ${formattedFee} Cr`
      : `₹ ${formattedFee.toFixed(1)} Cr`;
  }
  if (fee >= 100000) {
    const formattedFee = fee / 100000;
    return formattedFee % 1 === 0
      ? `₹ ${formattedFee} L`
      : `₹ ${formattedFee.toFixed(1)} L`;
  }
  if (fee >= 1000) {
    const formattedFee = fee / 1000;
    return formattedFee % 1 === 0
      ? `₹ ${formattedFee} K`
      : `₹ ${formattedFee.toFixed(1)} K`;
  }
  return `₹ ${fee}`;
};

/**
 * Format a fee range for display (₹).
 */
export const formatFeeRange = (
  minFee: number | null | undefined,
  maxFee: number | null | undefined
): string => {
  const formatFee = (fee: number | null | undefined): string => {
    if (fee == null || fee === 0) return "-";
    if (fee >= 10000000) {
      const formattedFee = fee / 10000000;
      return formattedFee % 1 === 0
        ? `₹ ${formattedFee} Cr`
        : `₹ ${formattedFee.toFixed(1)} Cr`;
    }
    if (fee >= 100000) {
      const formattedFee = fee / 100000;
      return formattedFee % 1 === 0
        ? `₹ ${formattedFee} L`
        : `₹ ${formattedFee.toFixed(1)} L`;
    }
    if (fee >= 1000) {
      const formattedFee = fee / 1000;
      return formattedFee % 1 === 0
        ? `₹ ${formattedFee} K`
        : `₹ ${formattedFee.toFixed(1)} K`;
    }
    return `₹ ${fee}`;
  };

  if (minFee && maxFee) {
    if (minFee === maxFee) {
      return formatFee(minFee);
    }
    return `${formatFee(minFee)} - ${formatFee(maxFee)}`;
  }

  if (minFee || maxFee) {
    return formatFee(minFee || maxFee);
  }
  return "-";
};

/**
 * Format duration in months or years.
 */
export function formatDuration(duration: number) {
  if (!duration || isNaN(duration)) return "";
  if (duration < 12) {
    return `${duration} month${duration > 1 ? "s" : ""}`;
  }
  const years = parseFloat((duration / 12).toFixed(1));
  return `${years} year${years > 1 ? "s" : ""}`;
}

export function formatDurationRange(minDuration: number, maxDuration: number) {
  if (!minDuration || isNaN(minDuration) || !maxDuration || isNaN(maxDuration))
    return "";
  if (minDuration === maxDuration) {
    return formatSingleDuration(minDuration);
  }
  return `${formatSingleDuration(minDuration)} - ${formatSingleDuration(
    maxDuration
  )}`;
}
function formatSingleDuration(duration: number) {
  if (duration < 12) {
    return `${duration} month${duration > 1 ? "s" : ""}`;
  }
  const years = parseFloat((duration / 12).toFixed(1));
  return `${years} year${years > 1 ? "s" : ""}`;
}

export const getTrueRating = (score: number | string | undefined = 3.4) => {
  const numericScore =
    typeof score === "number" ? score : parseFloat(score as string);
  return !isNaN(numericScore) && numericScore > 0
    ? numericScore.toFixed(1)
    : "3.4";
};

/**
 * Check if the URL is valid.
 */
export const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
// Split Silos
export const splitSilos = (silos: string) => {
  if (silos === "cut-off") return "cutoff";
  const silosArray = silos.split("-").filter((silos) => silos);
  return silosArray.join("_");
};

// Format Name
export function formatSilosName(input: string): string {
  let result: string = "";
  let capitalizeNext: boolean = true; // Track when to capitalize

  for (let i = 0; i < input.length; i++) {
    let char: string = input[i];

    if (char === "_") {
      result += " "; // Replace underscore with space
      capitalizeNext = true; // Next character should be capitalized
    } else {
      if (capitalizeNext && char >= "a" && char <= "z") {
        // Convert lowercase to uppercase manually
        char = String.fromCharCode(char.charCodeAt(0) - 32);
      }
      capitalizeNext = false; // Reset flag after capitalizing
      result += char;
    }
  }
  return result;
}

export const createSlugFromTitle = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

export const formatName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
