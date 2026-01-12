import React from "react";
import { SIDEBAR_NAVIGATION_ITEMS } from "../../config/sidebar-config";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const SidebarNavigation: React.FC = () => {
  return (
    <Card className="border border-border shadow-sm bg-card rounded-xl overflow-hidden">
      <CardContent className="p-2">
        <div className="space-y-0.5">
          {SIDEBAR_NAVIGATION_ITEMS[0].items.map((item, itemIndex) => (
            <Link
              href={item.href}
              key={itemIndex}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors group"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium group-hover:text-foreground transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
