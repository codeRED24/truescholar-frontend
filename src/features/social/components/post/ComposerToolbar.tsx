// Composer Toolbar Component
// Bottom toolbar with action buttons
"use client";

import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Smile,
  Sparkles,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ComposerToolbarProps {
  onMediaSelect: () => void;
  isMediaDisabled?: boolean;
  className?: string;
}

export function ComposerToolbar({
  onMediaSelect,
  isMediaDisabled,
  className,
}: ComposerToolbarProps) {
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <ToolbarButton
        icon={ImageIcon}
        tooltip="Add media"
        onClick={onMediaSelect}
        disabled={isMediaDisabled}
      />
      
      <ToolbarButton
        icon={Calendar}
        tooltip="Create an event"
        onClick={() => router.push("/feed/events/create")}
      />
      
      <ToolbarButton
        icon={Smile}
        tooltip="Add emoji"
        onClick={() => toast("Emoji picker coming soon")}
      />
      
      <div className="mx-1 h-5 w-px bg-border/60" />

      <Button
        type="button"
        variant="ghost"
        className="h-9 gap-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3 font-medium shrink-0 transition-colors"
        onClick={() => toast("AI Rewrite coming soon")}
      >
        <Sparkles className="h-4 w-4 text-purple-500" />
        <span className="text-sm">Rewrite with AI</span>
      </Button>
      
      <div className="flex-1" />
      
      <ToolbarButton
        icon={MoreHorizontal}
        tooltip="More options"
        onClick={() => toast("More options")}
      />
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ElementType;
  tooltip: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full shrink-0",
              className
            )}
            {...props}
          >
            <Icon className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
