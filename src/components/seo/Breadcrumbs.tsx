/**
 * Breadcrumbs Component
 * Visual breadcrumb navigation with integrated schema markup
 */

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/lib/seo/schema/JsonLd";
import { buildBreadcrumbSchema } from "@/lib/seo/schema/types/breadcrumb";

export interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  showSchema?: boolean;
  separator?: React.ReactNode;
}

/**
 * Breadcrumbs component with JSON-LD schema
 */
export function Breadcrumbs({
  items,
  className = "",
  showHome = true,
  showSchema = true,
  separator,
}: BreadcrumbsProps): React.ReactElement {
  // Ensure home is first if showHome is true
  const breadcrumbItems = showHome
    ? items[0]?.href === "/" 
      ? items 
      : [{ name: "Home", href: "/" }, ...items]
    : items;

  // Build schema data
  const schemaItems = breadcrumbItems.map((item) => ({
    name: item.name,
    url: item.href,
  }));

  const defaultSeparator = (
    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
  );

  return (
    <>
      {showSchema && <JsonLd data={buildBreadcrumbSchema(schemaItems)} />}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <span className="mx-1 md:mx-2">
                  {separator || defaultSeparator}
                </span>
              )}
              {item.current ? (
                <span
                  className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-none"
                  aria-current="page"
                >
                  {index === 0 && item.href === "/" ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    item.name
                  )}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary-main transition-colors truncate max-w-[150px] md:max-w-none"
                >
                  {index === 0 && item.href === "/" ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    item.name
                  )}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

/**
 * Compact breadcrumbs for mobile
 */
export function BreadcrumbsCompact({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}): React.ReactElement {
  // Show only the last 2 items on mobile
  const displayItems = items.length > 2 
    ? [{ name: "...", href: items[0].href }, ...items.slice(-2)]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm md:hidden ${className}`}
    >
      <ol className="flex items-center gap-1">
        {displayItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />
            )}
            {item.current ? (
              <span className="text-gray-700 font-medium truncate max-w-[120px]">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary-main truncate max-w-[100px]"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
