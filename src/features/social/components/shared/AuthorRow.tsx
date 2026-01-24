// Author Row Component
// Row displaying author with selection indicator
"use client";

import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AuthorRowProps {
  id: string;
  name: string;
  image?: string;
  type: "user" | "college";
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function AuthorRow({
  name,
  image,
  type,
  isSelected,
  onClick,
  className,
}: AuthorRowProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center w-full p-3 hover:bg-muted/50 transition-colors rounded-lg text-left group",
        className,
      )}
    >
      <Avatar className="h-10 w-10 mr-3 border border-border/40">
        <AvatarImage src={image} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground truncate">
          {name}
        </div>
        <div className="text-xs text-muted-foreground capitalize">
          {type === "user" ? "Personal Account" : "College Page"}
        </div>
      </div>

      <div
        className={cn(
          "h-5 w-5 rounded-full border border-muted-foreground/40 flex items-center justify-center transition-all",
          isSelected
            ? "bg-primary-main border-primary-main"
            : "group-hover:border-muted-foreground/60",
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}
