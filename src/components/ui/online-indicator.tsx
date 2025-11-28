import { cn } from "@/lib/utils"

interface OnlineIndicatorProps {
  online: boolean;
  className?: string;
}

export function OnlineIndicator({ online, className }: OnlineIndicatorProps) {
  return (
    <span 
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
        online ? "bg-green-500" : "bg-gray-400",
        className
      )}
    />
  )
}

// Optional: Pulse animation for online status
export function OnlineIndicatorPulse({ online, className }: OnlineIndicatorProps) {
  return (
    <span className={cn("absolute bottom-0 right-0", className)}>
      <span 
        className={cn(
          "absolute h-3 w-3 rounded-full border-2 border-white dark:border-gray-900",
          online ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {online && (
        <span className="absolute h-3 w-3 rounded-full bg-green-500 animate-ping" />
      )}
    </span>
  )
}
