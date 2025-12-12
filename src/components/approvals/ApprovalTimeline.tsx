import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ApprovalInstance } from '@/hooks/useApprovals';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Circle
} from 'lucide-react';

interface ApprovalTimelineProps {
  instance: ApprovalInstance;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ instance }) => {
  const steps = instance.steps || [];
  const workflowSteps = instance.workflow?.steps || [];

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepData = (stepNumber: number) => {
    return steps.find(s => s.step_number === stepNumber);
  };

  return (
    <div className="space-y-1">
      {/* Overall Status */}
      <div className="flex items-center justify-between mb-6 p-3 bg-muted/50 rounded-lg">
        <span className="font-medium">Overall Status</span>
        <Badge 
          variant={
            instance.status === 'approved' ? 'default' :
            instance.status === 'rejected' ? 'destructive' : 'secondary'
          }
        >
          {instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
        </Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        {workflowSteps.map((workflowStep: any, index: number) => {
          const stepData = getStepData(index + 1);
          const isCompleted = stepData?.status === 'approved' || stepData?.status === 'rejected';
          const isCurrent = instance.current_step === index + 1 && instance.status === 'pending';
          const isFuture = !stepData;

          return (
            <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div 
                  className={`absolute left-[9px] top-6 w-0.5 h-[calc(100%-12px)] ${
                    isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
                  }`}
                />
              )}
              
              {/* Icon */}
              <div className={`relative z-10 shrink-0 ${isCurrent ? 'animate-pulse' : ''}`}>
                {isFuture ? (
                  <Circle className="h-5 w-5 text-muted-foreground/50" />
                ) : (
                  getStepIcon(stepData?.status || 'pending')
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium ${isFuture ? 'text-muted-foreground' : ''}`}>
                    Step {index + 1}
                  </span>
                  {stepData?.decided_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(stepData.decided_at), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>

                {stepData?.approver && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={stepData.approver.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {stepData.approver.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{stepData.approver.full_name}</span>
                    {stepData.status && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          stepData.status === 'approved' ? 'text-green-600 border-green-200' :
                          stepData.status === 'rejected' ? 'text-red-600 border-red-200' :
                          'text-yellow-600 border-yellow-200'
                        }`}
                      >
                        {stepData.status}
                      </Badge>
                    )}
                  </div>
                )}

                {stepData?.comments && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    "{stepData.comments}"
                  </div>
                )}

                {isFuture && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Waiting for previous step
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta Info */}
      <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
        <p>Created {formatDistanceToNow(new Date(instance.created_at), { addSuffix: true })}</p>
      </div>
    </div>
  );
};
