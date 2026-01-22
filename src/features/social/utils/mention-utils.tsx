
import Link from "next/link";
import React from "react";
import { EntityHandle } from "../types";

function renderTextWithHandles(text: string, mentions?: EntityHandle[]) {
  const handleRegex = /@([a-zA-Z0-9_]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = handleRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const handle = match[1];
    const mention = mentions?.find((m) => m.handle === handle);

    let href = `/profile/${handle}`;
    if (mention) {
      if (mention.entityType === "user") href = `/profile/${mention.entityId}`;
      else if (mention.entityType === "college")
        href = `/colleges/${mention.entityId}`;
      else if (mention.entityType === "company")
        href = `/companies/${mention.entityId}`;
    }

    parts.push(
      <Link
        key={`handle-${match.index}`}
        href={href}
        className="text-blue-600 hover:underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        @{handle}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export function renderContentWithMentions(
  content: string,
  mentions?: EntityHandle[]
) {
  if (!content) return null;

  // Regex matches @[display](encodedId)
  const markupRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = markupRegex.exec(content)) !== null) {
    // Process text before match
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      const processed = renderTextWithHandles(textBefore, mentions);
      if (Array.isArray(processed)) parts.push(...processed);
      else parts.push(processed);
    }

    const [fullMatch, display, encodedId] = match;

    let href = "#";
    if (encodedId.includes(":")) {
      const [type, id] = encodedId.split(":");
      if (type === "user") href = `/profile/${id}`;
      else if (type === "college") href = `/colleges/${id}`;
      else if (type === "company") href = `/companies/${id}`;
      else href = `/profile/${id}`;
    } else {
      href = `/profile/${encodedId}`;
    }

    parts.push(
      <Link
        key={match.index}
        href={href}
        className="text-blue-600 hover:underline font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        @{display}
      </Link>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Process remaining text
  if (lastIndex < content.length) {
    const textAfter = content.substring(lastIndex);
    const processed = renderTextWithHandles(textAfter, mentions);
    if (Array.isArray(processed)) parts.push(...processed);
    else parts.push(processed);
  }

  if (parts.length === 0) return content;

  return parts;
}
