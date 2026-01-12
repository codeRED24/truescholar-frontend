import React from "react";
import {
  RIGHT_SIDEBAR_COURSES,
  RIGHT_SIDEBAR_NEWS,
} from "../../config/sidebar-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ArrowRight } from "lucide-react";

interface SidebarWidgetProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}

const SidebarWidget: React.FC<SidebarWidgetProps> = ({
  title,
  icon: Icon,
  children,
  actionHref,
  actionLabel,
}) => {
  return (
    <Card className="mb-4 last:mb-0 bg-card rounded-xl border shadow-sm">
      <CardHeader className="pb-3 px-4 pt-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <CardTitle className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
        </div>
        {/* Helper info icon for later usage if needed */}
        <Info className="h-3 w-3 text-muted-foreground cursor-pointer" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {children}
        {actionHref && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground h-8"
          >
            {actionLabel || "View All"} <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const RightSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* News Widget */}
      <SidebarWidget
        title="Trending News"
        actionHref="/news"
        actionLabel="Read more"
      >
        <ul className="space-y-4">
          {RIGHT_SIDEBAR_NEWS.map((item) => (
            <li key={item.id} className="flex gap-3 group cursor-pointer">
              <div className="h-12 w-12 rounded bg-muted shrink-0 overflow-hidden">
                {item.img ? (
                  <img
                    src={item.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h5>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {item.time}
                  </span>
                  <span className="text-[10px] text-muted-foreground">•</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.readers}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </SidebarWidget>

      {/* Courses Widget */}
      <SidebarWidget
        title="Recommended Courses"
        actionHref="/courses"
        actionLabel="Explore Courses"
      >
        <ul className="space-y-4">
          {RIGHT_SIDEBAR_COURSES.map((course) => (
            <li key={course.id} className="flex gap-3 group cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-primary/10 shrink-0 overflow-hidden flex items-center justify-center text-primary font-bold text-xs">
                {course.img ? (
                  <img
                    src={course.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "U"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h5>
                <p className="text-[10px] text-muted-foreground truncate">
                  {course.university}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {course.students}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </SidebarWidget>
    </div>
  );
};
