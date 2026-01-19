/**
 * Page SEO Wrapper Component
 * Provides a standardized layout with SEO elements
 */

import React from "react";
import { JsonLd } from "@/lib/seo/schema/JsonLd";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { HubLinks, TabLink, HubLink } from "./HubLinks";
import { RelatedLinks, RelatedLink } from "./RelatedLinks";

export interface PageSEOProps {
  // Schema data for JSON-LD
  schema?: object;
  // Breadcrumb items
  breadcrumbs?: BreadcrumbItem[];
  // Page title (for H1)
  title?: string;
  // Subtitle or description
  subtitle?: string;
  // Tab/silo navigation
  tabLinks?: TabLink[];
  // Hub page link
  hubPage?: HubLink;
  // Cross-category links
  crossLinks?: HubLink[];
  // Related content
  relatedItems?: RelatedLink[];
  // Children content
  children: React.ReactNode;
  // Layout variant
  layout?: "default" | "with-sidebar" | "full-width";
  // Show related section
  showRelated?: boolean;
  // Custom class names
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

/**
 * SEO-optimized page wrapper
 * Provides consistent structure with schema, breadcrumbs, and internal linking
 */
export function PageSEO({
  schema,
  breadcrumbs,
  title,
  subtitle,
  tabLinks,
  hubPage,
  crossLinks,
  relatedItems,
  children,
  layout = "default",
  showRelated = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: PageSEOProps): React.ReactElement {
  return (
    <>
      {/* JSON-LD Schema */}
      {schema && <JsonLd data={schema} />}

      <div className={`${className}`}>
        {/* Header Section with Breadcrumbs */}
        {(breadcrumbs || title) && (
          <header className={`mb-6 ${headerClassName}`}>
            {breadcrumbs && (
              <Breadcrumbs
                items={breadcrumbs}
                className="mb-4"
                showSchema={!schema} // Only show schema if not provided separately
              />
            )}

            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 text-gray-600">{subtitle}</p>
            )}
          </header>
        )}

        {/* Layout Variants */}
        {layout === "with-sidebar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <main className={`lg:col-span-3 ${contentClassName}`}>
              {children}
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {(hubPage || tabLinks || crossLinks) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <HubLinks
                    hubPage={hubPage}
                    tabLinks={tabLinks}
                    crossLinks={crossLinks}
                  />
                </div>
              )}

              {showRelated && relatedItems && relatedItems.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <RelatedLinks
                    title="Related"
                    links={relatedItems}
                    layout="list"
                    maxItems={5}
                  />
                </div>
              )}
            </aside>
          </div>
        ) : layout === "full-width" ? (
          <main className={contentClassName}>
            {children}

            {/* Full-width related section */}
            {showRelated && relatedItems && relatedItems.length > 0 && (
              <section className="mt-12 pt-8 border-t border-gray-200">
                <RelatedLinks
                  title="You May Also Like"
                  links={relatedItems}
                  layout="grid"
                  maxItems={6}
                />
              </section>
            )}
          </main>
        ) : (
          /* Default layout */
          <main className={contentClassName}>
            {children}

            {/* Inline hub links */}
            {(hubPage || crossLinks) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <HubLinks
                  hubPage={hubPage}
                  crossLinks={crossLinks}
                />
              </div>
            )}

            {/* Related section */}
            {showRelated && relatedItems && relatedItems.length > 0 && (
              <section className="mt-8">
                <RelatedLinks
                  title="Related"
                  links={relatedItems}
                  layout="grid"
                  maxItems={6}
                />
              </section>
            )}
          </main>
        )}
      </div>
    </>
  );
}

/**
 * Entity page header with SEO elements
 */
export function EntityHeader({
  breadcrumbs,
  title,
  subtitle,
  logo,
  location,
  rating,
  badges,
  actions,
  className = "",
}: {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  logo?: string;
  location?: string;
  rating?: number;
  badges?: Array<{ label: string; variant?: "default" | "success" | "warning" }>;
  actions?: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return (
    <header className={`${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {logo && (
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt={title}
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h1>

          {(location || rating) && (
            <div className="flex items-center gap-3 mt-2 text-gray-600">
              {location && <span>{location}</span>}
              {rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}

          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    badge.variant === "success"
                      ? "bg-green-100 text-green-700"
                      : badge.variant === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export default PageSEO;
