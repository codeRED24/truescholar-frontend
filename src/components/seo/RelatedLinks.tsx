/**
 * Related Links Component
 * Displays related content for internal linking
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Building2, FileText, GraduationCap } from "lucide-react";

export interface RelatedLink {
  id: number;
  name: string;
  href: string;
  type?: "college" | "exam" | "article";
  location?: string;
  description?: string;
}

export interface RelatedLinksProps {
  title?: string;
  links: RelatedLink[];
  className?: string;
  layout?: "list" | "grid" | "compact";
  showIcon?: boolean;
  maxItems?: number;
}

/**
 * Related links section for internal linking
 */
export function RelatedLinks({
  title = "Related",
  links,
  className = "",
  layout = "list",
  showIcon = true,
  maxItems = 6,
}: RelatedLinksProps): React.ReactElement | null {
  if (!links || links.length === 0) {
    return null;
  }

  const displayLinks = links.slice(0, maxItems);

  const getIcon = (type?: string) => {
    switch (type) {
      case "college":
        return <Building2 className="h-4 w-4 text-gray-400" />;
      case "exam":
        return <GraduationCap className="h-4 w-4 text-gray-400" />;
      case "article":
        return <FileText className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  if (layout === "compact") {
    return (
      <div className={`${className}`}>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {displayLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-main hover:text-white rounded-full text-gray-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="group p-3 border border-gray-200 rounded-lg hover:border-primary-main hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-2">
                {showIcon && getIcon(link.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-primary-main truncate">
                    {link.name}
                  </p>
                  {link.location && (
                    <p className="text-xs text-gray-500 mt-0.5">{link.location}</p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-main flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Default list layout
  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="space-y-2">
        {displayLinks.map((link) => (
          <li key={link.id}>
            <Link
              href={link.href}
              className="group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showIcon && getIcon(link.type)}
              <span className="flex-1 text-sm text-gray-700 group-hover:text-primary-main truncate">
                {link.name}
              </span>
              {link.location && (
                <span className="text-xs text-gray-400">{link.location}</span>
              )}
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-main opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "You may also like" section
 */
export function YouMayAlsoLike({
  items,
  className = "",
}: {
  items: RelatedLink[];
  className?: string;
}): React.ReactElement | null {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 6).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-primary-main transition-all"
          >
            <h3 className="font-medium text-gray-800 group-hover:text-primary-main line-clamp-2">
              {item.name}
            </h3>
            {item.location && (
              <p className="text-sm text-gray-500 mt-1">{item.location}</p>
            )}
            {item.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {item.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RelatedLinks;
