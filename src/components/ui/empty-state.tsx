import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className,
  compact = false 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "text-center px-4",
      compact ? "py-8" : "py-12",
      className
    )}>
      <div className={cn(
        "mx-auto rounded-full bg-muted flex items-center justify-center mb-4",
        compact ? "w-12 h-12" : "w-16 h-16"
      )}>
        <Icon className={cn(
          "text-muted-foreground",
          compact ? "h-6 w-6" : "h-8 w-8"
        )} />
      </div>
      <h3 className={cn(
        "font-semibold text-foreground mb-2",
        compact ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-muted-foreground max-w-sm mx-auto",
        compact ? "text-sm mb-4" : "mb-6"
      )}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-primary hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
