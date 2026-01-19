/**
 * Enhanced JSON-LD Component
 * React component for rendering structured data
 */

import React from "react";

export interface JsonLdProps {
  data: object | object[];
  id?: string;
}

/**
 * Render JSON-LD structured data
 * Handles both single objects and arrays
 */
export function JsonLd({ data, id }: JsonLdProps): React.ReactElement {
  // Handle empty data
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <></>;
  }

  // Sanitize the JSON to prevent XSS
  const sanitizedJson = JSON.stringify(data, null, 0)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  );
}

/**
 * Render multiple JSON-LD blocks
 * Use when you need separate script tags for different schemas
 */
export function JsonLdMultiple({
  schemas,
}: {
  schemas: Array<{ data: object; id?: string }>;
}): React.ReactElement {
  return (
    <>
      {schemas.map((schema, index) => (
        <JsonLd
          key={schema.id || `jsonld-${index}`}
          data={schema.data}
          id={schema.id}
        />
      ))}
    </>
  );
}

/**
 * HOC to wrap a component with JSON-LD data
 */
export function withJsonLd<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  getSchemaData: (props: P) => object
): React.FC<P> {
  return function WithJsonLdComponent(props: P) {
    const schemaData = getSchemaData(props);

    return (
      <>
        <JsonLd data={schemaData} />
        <WrappedComponent {...props} />
      </>
    );
  };
}

export default JsonLd;
