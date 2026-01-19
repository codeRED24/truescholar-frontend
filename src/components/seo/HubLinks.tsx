/**
 * Hub Links Component
 * Displays hub-and-spoke navigation for SEO internal linking
 */

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Grid,
} from "lucide-react";

export interface HubLink {
  label: string;
  href: string;
  description?: string;
  priority?: number;
  isExternal?: boolean;
}

export interface TabLink {
  label: string;
  href: string;
  available: boolean;
  active?: boolean;
}

export interface HubLinksProps {
  // Main hub page link
  hubPage?: HubLink;
  // Tab/silo navigation
  tabLinks?: TabLink[];
  // Cross-category links
  crossLinks?: HubLink[];
  // Current page label (for "Back to X" link)
  currentPageLabel?: string;
  className?: string;
}

/**
 * Hub page navigation section
 */
export function HubLinks({
  hubPage,
  tabLinks,
  crossLinks,
  currentPageLabel,
  className = "",
}: HubLinksProps): React.ReactElement {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Back to hub link */}
      {hubPage && (
        <Link
          href={hubPage.href}
          className="inline-flex items-center gap-2 text-sm text-primary-main hover:underline"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to {hubPage.label}
        </Link>
      )}

      {/* Tab navigation */}
      {tabLinks && tabLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {currentPageLabel ? `More about ${currentPageLabel}` : "Quick Links"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tabLinks
              .filter((tab) => tab.available && !tab.active)
              .map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-primary-main hover:text-white text-gray-700 rounded-full transition-colors"
                >
                  {tab.label}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Cross-category links */}
      {crossLinks && crossLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Related Categories
          </h3>
          <ul className="space-y-1">
            {crossLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center gap-2 py-1.5 text-sm text-gray-600 hover:text-primary-main transition-colors"
                >
                  <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-primary-main" />
                  {link.label}
                  {link.isExternal && (
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Full-width tab navigation bar
 */
export function TabNavigation({
  tabs,
  activeTab,
  baseHref,
  className = "",
}: {
  tabs: Array<{ key: string; label: string; path: string; available?: boolean }>;
  activeTab: string;
  baseHref: string;
  className?: string;
}): React.ReactElement {
  return (
    <nav className={`border-b border-gray-200 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide -mb-px">
        {tabs
          .filter((tab) => tab.available !== false)
          .map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Link
                key={tab.key}
                href={`${baseHref}${tab.path}`}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "text-primary-main border-primary-main"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}

/**
 * Quick links grid for footer/sidebar
 */
export function QuickLinksGrid({
  title,
  links,
  columns = 2,
  className = "",
}: {
  title: string;
  links: HubLink[];
  columns?: 2 | 3 | 4;
  className?: string;
}): React.ReactElement | null {
  if (!links || links.length === 0) {
    return null;
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`${className}`}>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Grid className="h-4 w-4" />
        {title}
      </h3>
      <div className={`grid ${gridCols[columns]} gap-2`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-gray-600 hover:text-primary-main py-1 truncate"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar navigation for entity pages
 */
export function SidebarNav({
  title,
  links,
  activeHref,
  className = "",
}: {
  title: string;
  links: Array<{ label: string; href: string; count?: number }>;
  activeHref?: string;
  className?: string;
}): React.ReactElement {
  return (
    <nav className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = link.href === activeHref;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary-main/10 text-primary-main font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{link.label}</span>
                {link.count !== undefined && (
                  <span className="text-xs text-gray-400">{link.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default HubLinks;
