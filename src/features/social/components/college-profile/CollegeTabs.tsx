"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCollegeProfilePath } from "../../utils/author-navigation";

interface CollegeTabsProps {
  slugId: string;
}

export function CollegeTabs({ slugId }: CollegeTabsProps) {
  const pathname = usePathname();

  // Check if we are in the feed route
  const isFeedRoute = pathname.includes("/feed/");
  const basePath = isFeedRoute
    ? getCollegeProfilePath(slugId)
    : `/colleges/${slugId}`;

  const tabs = [
    { name: "Home", path: basePath, exact: true },
    { name: "About", path: `${basePath}/about` },
    { name: "Posts", path: `${basePath}/posts` },
    { name: "Events", path: `${basePath}/events` },
    { name: "People", path: `${basePath}/people` },
  ];

  return (
    <div className="bg-background border rounded-lg px-6 mb-6 sticky top-16 z-20">
      <div className="flex gap-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.path
            : pathname.startsWith(tab.path);

          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={cn(
                "py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
