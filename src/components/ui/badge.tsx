import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "bg-success/20 text-success border border-success/30",
        warning:
          "bg-warning/20 text-warning-foreground border border-warning/30",
        info:
          "bg-info/20 text-info border border-info/30",
        outline: "text-foreground border",
        // Status badges using semantic tokens
        verified: "bg-success/20 text-success border border-success/30",
        pending: "bg-warning/20 text-warning-foreground border border-warning/30",
        rejected: "bg-destructive/20 text-destructive border border-destructive/30",
        inProgress: "bg-info/20 text-info border border-info/30",
        inactive: "bg-muted text-muted-foreground border border-border",
        // Role badges
        admin: "bg-primary text-primary-foreground px-3 py-1 border-transparent",
        intern: "bg-secondary text-secondary-foreground px-3 py-1 border-transparent",
        // Priority badges
        urgent: "bg-destructive/20 text-destructive border border-destructive/30",
        high: "bg-warning/20 text-warning-foreground border border-warning/30",
        medium: "bg-info/20 text-info border border-info/30",
        low: "bg-success/20 text-success border border-success/30",
        // Count badge
        count: "bg-destructive text-destructive-foreground h-5 min-w-[1.25rem] px-1.5 py-0.5 border-2 border-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
