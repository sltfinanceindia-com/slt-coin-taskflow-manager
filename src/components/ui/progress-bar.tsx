import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number; // 0-100
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({ 
  value, 
  showPercentage = false, 
  size = "md",
  className 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }

  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("w-full space-y-1", className)}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
          <span>Progress</span>
          <span className="font-medium">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn(
        "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div 
          className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
