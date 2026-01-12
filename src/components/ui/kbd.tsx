import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-neutral-100 text-neutral-500 pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium dark:bg-neutral-800 dark:text-neutral-400",
        "[&_svg:not([class*='size-'])]:size-3",
        "in-data-[slot=tooltip-content]:bg-white/20 in-data-[slot=tooltip-content]:text-white dark:in-data-[slot=tooltip-content]:bg-white/10 dark:in-data-[slot=tooltip-content]:bg-neutral-950/20 dark:in-data-[slot=tooltip-content]:text-neutral-950 dark:dark:in-data-[slot=tooltip-content]:bg-neutral-950/10",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
