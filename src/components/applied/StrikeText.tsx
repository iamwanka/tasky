import { cn } from "@/lib/utils"

type StrikeTextProps = {
  done: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Text whose strike-through line grows in from the left instead of
 * snapping on instantly — same idea Todoist/Things use for checking
 * something off.
 */
function StrikeText({ done, className, children }: StrikeTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block transition-colors duration-300",
        done && "text-muted-foreground",
        className
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-y-0 left-0 top-1/2 h-px bg-current transition-all duration-300 ease-out",
          done ? "w-full" : "w-0"
        )}
      />
    </span>
  )
}

export default StrikeText
