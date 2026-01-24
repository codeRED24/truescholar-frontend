// Visibility Options Component
// Radio group for selecting post visibility
"use client";

import { Globe, Users, Lock, Check, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostVisibility, AuthorType } from "../../types";

interface VisibilityOptionsProps {
  value: PostVisibility;
  onChange: (value: PostVisibility) => void;
  authorType?: AuthorType;
}

export function VisibilityOptions({
  value,
  onChange,
  authorType = "user",
}: VisibilityOptionsProps) {
  const options =
    authorType === "college"
      ? ([
          {
            id: "public",
            label: "Anyone",
            description: "Anyone on or off TrueScholar",
            icon: Globe,
          },
          {
            id: "followers",
            label: "Followers",
            description: "People following this page",
            icon: Users,
          },
          {
            id: "college",
            label: "College Members",
            description: "Students, Alumni & Staff",
            icon: GraduationCap,
          },
          {
            id: "private",
            label: "Admins only",
            description: "Visible only to page admins",
            icon: Lock,
          },
        ] as const)
      : ([
          {
            id: "public",
            label: "Anyone",
            description: "Anyone on or off TrueScholar",
            icon: Globe,
          },
          {
            id: "followers",
            label: "Connections only",
            description: "Connections on TrueScholar",
            icon: Users,
          },
          {
            id: "college",
            label: "College",
            description: "Students & Alumni only",
            icon: GraduationCap,
          },
          {
            id: "private",
            label: "Only me",
            description: "Visible only to you",
            icon: Lock,
          },
        ] as const);

  return (
    <div className="flex flex-col gap-1 p-2">
      <h3 className="text-sm font-semibold mb-2 px-2 text-muted-foreground uppercase tracking-wider">
        Who can see your post?
      </h3>

      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className="flex items-start p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
        >
          <div className="mt-1 p-2 bg-muted rounded-full mr-4 group-hover:bg-background transition-colors">
            <opt.icon className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1">
            <div className="font-medium text-foreground">{opt.label}</div>
            <div className="text-sm text-muted-foreground">
              {opt.description}
            </div>
          </div>

          <div
            className={cn(
              "h-5 w-5 rounded-full border border-muted-foreground/40 flex items-center justify-center mt-2 transition-all",
              value === opt.id
                ? "bg-primary-main border-primary-main"
                : "group-hover:border-muted-foreground/60",
            )}
          >
            {value === opt.id && <Check className="h-3 w-3 text-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}
