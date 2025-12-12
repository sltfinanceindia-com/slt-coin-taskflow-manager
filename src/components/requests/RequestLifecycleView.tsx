import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileEdit, Send, Search, CheckCircle2, 
  XCircle, FolderKanban, Clock, ArrowRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LifecycleStage = 'draft' | 'submitted' | 'review' | 'approved' | 'rejected' | 'converted';

interface RequestLifecycleViewProps {
  currentStage: LifecycleStage;
  createdAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  convertedTaskId?: string;
  compact?: boolean;
}

const stages: { key: LifecycleStage; label: string; icon: React.ReactNode }[] = [
  { key: 'draft', label: 'Draft', icon: <FileEdit className="h-4 w-4" /> },
  { key: 'submitted', label: 'Submitted', icon: <Send className="h-4 w-4" /> },
  { key: 'review', label: 'In Review', icon: <Search className="h-4 w-4" /> },
  { key: 'approved', label: 'Approved', icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: 'converted', label: 'Converted', icon: <FolderKanban className="h-4 w-4" /> },
];

const stageOrder: Record<LifecycleStage, number> = {
  draft: 0,
  submitted: 1,
  review: 2,
  approved: 3,
  rejected: 3,
  converted: 4,
};

export function RequestLifecycleView({ 
  currentStage, 
  createdAt,
  submittedAt,
  reviewedAt,
  resolvedAt,
  convertedTaskId,
  compact = false 
}: RequestLifecycleViewProps) {
  const currentIndex = stageOrder[currentStage];
  const isRejected = currentStage === 'rejected';

  // Filter stages - show rejected instead of approved if rejected
  const displayStages = isRejected 
    ? stages.map(s => s.key === 'approved' ? { key: 'rejected' as LifecycleStage, label: 'Rejected', icon: <XCircle className="h-4 w-4" /> } : s)
    : stages;

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {displayStages.slice(0, 4).map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isActive = isCompleted || isCurrent;

          return (
            <React.Fragment key={stage.key}>
              <Badge
                variant={isCurrent ? 'default' : isCompleted ? 'secondary' : 'outline'}
                className={cn(
                  'text-xs',
                  isRejected && isCurrent && 'bg-destructive text-destructive-foreground',
                  !isActive && 'text-muted-foreground'
                )}
              >
                {stage.label}
              </Badge>
              {index < displayStages.slice(0, 4).length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Request Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                isRejected ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${(currentIndex / (displayStages.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stages */}
          <div className="relative flex justify-between">
            {displayStages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isActive = isCompleted || isCurrent;
              const isPast = index <= currentIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted && 'bg-primary border-primary text-primary-foreground',
                      isCurrent && !isRejected && 'bg-primary border-primary text-primary-foreground ring-4 ring-primary/20',
                      isCurrent && isRejected && 'bg-destructive border-destructive text-destructive-foreground ring-4 ring-destructive/20',
                      !isActive && 'bg-background border-muted text-muted-foreground'
                    )}
                  >
                    {stage.icon}
                  </div>
                  <span 
                    className={cn(
                      'mt-2 text-xs font-medium text-center',
                      isPast ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </span>
                  {/* Timestamp */}
                  {isPast && (
                    <span className="mt-1 text-[10px] text-muted-foreground">
                      {index === 0 && createdAt && new Date(createdAt).toLocaleDateString()}
                      {index === 1 && submittedAt && new Date(submittedAt).toLocaleDateString()}
                      {index === 2 && reviewedAt && new Date(reviewedAt).toLocaleDateString()}
                      {index === 3 && resolvedAt && new Date(resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-6 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {currentStage === 'draft' && 'Request saved as draft. Submit when ready.'}
            {currentStage === 'submitted' && 'Request submitted and awaiting review.'}
            {currentStage === 'review' && 'Request is being reviewed by the team.'}
            {currentStage === 'approved' && 'Request has been approved.'}
            {currentStage === 'rejected' && 'Request was rejected. Check notes for details.'}
            {currentStage === 'converted' && (
              <>
                Request converted to task.
                {convertedTaskId && (
                  <Badge variant="outline" className="ml-2">
                    Task #{convertedTaskId.slice(0, 8)}
                  </Badge>
                )}
              </>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for list items
export function RequestLifecycleBadge({ stage }: { stage: LifecycleStage }) {
  const config: Record<LifecycleStage, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
    draft: { label: 'Draft', variant: 'outline', icon: <FileEdit className="h-3 w-3" /> },
    submitted: { label: 'Submitted', variant: 'secondary', icon: <Send className="h-3 w-3" /> },
    review: { label: 'In Review', variant: 'default', icon: <Search className="h-3 w-3" /> },
    approved: { label: 'Approved', variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected: { label: 'Rejected', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    converted: { label: 'Converted', variant: 'secondary', icon: <FolderKanban className="h-3 w-3" /> },
  };

  const { label, variant, icon } = config[stage];

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {label}
    </Badge>
  );
}
