// Author Header Component
// Displays author avatar, name, and timestamp

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "../../utils/formatters";
import type { Author } from "../../types";
import { cn } from "@/lib/utils";

interface AuthorHeaderProps {
  author: Author;
  createdAt: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  subtitle?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onFollow?: () => void;
}

const sizeClasses = {
  sm: {
    avatar: "h-8 w-8",
    name: "text-sm font-medium",
    meta: "text-xs",
  },
  md: {
    avatar: "h-10 w-10",
    name: "text-sm font-semibold",
    meta: "text-xs",
  },
  lg: {
    avatar: "h-12 w-12",
    name: "text-base font-semibold",
    meta: "text-sm",
  },
};

const userTypeBadgeStyles: Record<string, string> = {
  student: "bg-primary/10 text-primary",
  faculty: "bg-primary/10 text-primary",
  college: "bg-primary/10 text-primary",
  alumni: "bg-primary/10 text-primary",
};

export function AuthorHeader({
  author,
  createdAt,
  size = "md",
  showBadge = true,
  subtitle,
  className,
  onClick,
}: AuthorHeaderProps) {
  const classes = sizeClasses[size];
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const badgeStyle = author.user_type
    ? userTypeBadgeStyles[author.user_type] ?? "bg-muted text-muted-foreground"
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      <Avatar className={classes.avatar}>
        <AvatarImage src={author.image ?? undefined} alt={author.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(classes.name, "truncate")}>{author.name}</span>
          {showBadge && author.user_type && badgeStyle && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 capitalize",
                badgeStyle
              )}
            >
              {author.user_type}
            </Badge>
          )}
        </div>

        {subtitle ? (
            <div className={cn(classes.meta, "text-muted-foreground truncate")}>
                {subtitle}
            </div>
        ) : (
            <span className={cn(classes.meta, "text-muted-foreground")}>
            {formatRelativeTime(createdAt)}
            </span>
        )}
      </div>
    </div>
  );
}
