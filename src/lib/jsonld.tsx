import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

/**
 * Base JSON-LD component for structured data
 * Renders JSON-LD script tag with proper escaping
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}
