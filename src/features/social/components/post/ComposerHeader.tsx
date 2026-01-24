// Composer Header Component
// Avatar, name, and visibility subtitle
"use client";

import { Globe, Users, Lock, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { PostVisibility, AuthorType } from "../../types";

interface ComposerHeaderProps {
  authorName: string;
  authorImage?: string;
  authorType: AuthorType;
  visibility: PostVisibility;
  onAuthorClick: () => void;
  className?: string;
}

const visibilityIcons = {
  public: Globe,
  followers: Users,
  private: Lock,
  college: Users, // Fallback
};

const visibilityLabels = {
  public: "Anyone",
  followers: "Connections only",
  private: "Only me",
  college: "College only",
};

export function ComposerHeader({
  authorName,
  authorImage,
  authorType,
  visibility,
  onAuthorClick,
  className,
}: ComposerHeaderProps) {
  const VisibilityIcon = visibilityIcons[visibility] || Globe;
  const visibilityLabel = visibilityLabels[visibility] || "Anyone";
  
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar className="h-12 w-12 border border-border/50">
        <AvatarImage src={authorImage} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-start">
        <button 
          onClick={onAuthorClick}
          className="font-bold text-lg leading-none mb-1 text-foreground hover:underline decoration-muted-foreground/50 underline-offset-4 decoration-2"
        >
          {authorName}
          {authorType === "college" && (
            <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded align-middle">
              College
            </span>
          )}
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAuthorClick}
          className="h-6 px-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full font-medium text-xs gap-1"
        >
          <VisibilityIcon className="h-3 w-3" />
          <span>{visibilityLabel}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </div>
    </div>
  );
}
