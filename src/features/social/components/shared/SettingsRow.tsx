// Settings Row Component
// Reusable clickable row for settings menu
"use client";

import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  icon?: LucideIcon;
  label: string;
  value?: string | React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  className,
  disabled,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center w-full p-4 hover:bg-muted/50 transition-colors text-left",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 mr-3 text-muted-foreground" />}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
      </div>
      <div className="flex items-center gap-2">
        {value && (
          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
            {value}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
      </div>
    </button>
  );
}
