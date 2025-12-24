import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export function SkeletonCard({ 
  className, 
  showHeader = true, 
  showFooter = false,
  lines = 3 
}: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-4" 
            style={{ width: `${100 - i * 15}%` }} 
          />
        ))}
        {showFooter && (
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-0 p-4">
          <div className="flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4 flex-1" 
                style={{ opacity: 1 - rowIndex * 0.1 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end gap-2 pt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md" 
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}
