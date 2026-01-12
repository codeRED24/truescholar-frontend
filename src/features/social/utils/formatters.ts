// Date and number formatters for social content

/**
 * Format a date as relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks}w`;
  } else if (diffMonths < 12) {
    return `${diffMonths}mo`;
  } else {
    return `${diffYears}y`;
  }
}

/**
 * Format a number with compact notation (e.g., 1.2K, 4.5M)
 */
export function formatCount(count: number): string {
  if (count < 1000) {
    return String(count);
  } else if (count < 1_000_000) {
    const value = count / 1000;
    return value >= 10 ? `${Math.floor(value)}K` : `${value.toFixed(1)}K`;
  } else if (count < 1_000_000_000) {
    const value = count / 1_000_000;
    return value >= 10 ? `${Math.floor(value)}M` : `${value.toFixed(1)}M`;
  } else {
    const value = count / 1_000_000_000;
    return value >= 10 ? `${Math.floor(value)}B` : `${value.toFixed(1)}B`;
  }
}

/**
 * Format a date for display (e.g., "Jan 5, 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date with time (e.g., "Jan 5, 2026 at 3:30 PM")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
