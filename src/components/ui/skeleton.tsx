import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)}
      {...props}
    />
  )
}

// Skeleton for metric cards
function SkeletonMetricCard() {
  return (
    <div className="h-48 bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-12 w-16 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    </div>
  )
}

// Skeleton for table
function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 flex items-center gap-4 px-6">
            <Skeleton className="h-4 w-full max-w-xs" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for list items
function SkeletonListItem() {
  return (
    <div className="h-16 flex items-center gap-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// Skeleton for form fields
function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  )
}

// Skeleton for card
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonMetricCard, 
  SkeletonTable, 
  SkeletonListItem, 
  SkeletonFormField,
  SkeletonCard 
}
