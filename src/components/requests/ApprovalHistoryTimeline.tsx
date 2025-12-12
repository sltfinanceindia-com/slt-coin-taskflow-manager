import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, XCircle, Clock, MessageSquare, 
  UserPlus, ArrowRight, FileText, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface ApprovalHistoryItem {
  id: string;
  action: 'created' | 'submitted' | 'assigned' | 'commented' | 'approved' | 'rejected' | 'converted' | 'rated';
  timestamp: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  details?: string;
  metadata?: Record<string, any>;
}

interface ApprovalHistoryTimelineProps {
  history: ApprovalHistoryItem[];
  className?: string;
}

const actionConfig: Record<ApprovalHistoryItem['action'], { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  label: string;
}> = {
  created: { 
    icon: <FileText className="h-4 w-4" />, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    label: 'Request created'
  },
  submitted: { 
    icon: <ArrowRight className="h-4 w-4" />, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    label: 'Submitted for review'
  },
  assigned: { 
    icon: <UserPlus className="h-4 w-4" />, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    label: 'Assigned'
  },
  commented: { 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    label: 'Added comment'
  },
  approved: { 
    icon: <CheckCircle2 className="h-4 w-4" />, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    label: 'Approved'
  },
  rejected: { 
    icon: <XCircle className="h-4 w-4" />, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    label: 'Rejected'
  },
  converted: { 
    icon: <ArrowRight className="h-4 w-4" />, 
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    label: 'Converted to task'
  },
  rated: { 
    icon: <Star className="h-4 w-4" />, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    label: 'Feedback submitted'
  },
};

export function ApprovalHistoryTimeline({ history, className }: ApprovalHistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          {/* Timeline items */}
          <div className="space-y-6">
            {history.map((item, index) => {
              const config = actionConfig[item.action];
              const isFirst = index === 0;
              const isLast = index === history.length - 1;

              return (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline node */}
                  <div 
                    className={cn(
                      'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-background',
                      config.bgColor,
                      config.color
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className={cn(
                    'flex-1 pb-6',
                    isLast && 'pb-0'
                  )}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {item.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{item.user.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs w-fit">
                        {config.label}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {format(new Date(item.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                    </p>

                    {item.details && (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm">
                        {item.details}
                      </div>
                    )}

                    {item.action === 'assigned' && item.metadata?.assignee && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>
                        <Badge variant="secondary">{item.metadata.assignee}</Badge>
                      </div>
                    )}

                    {item.action === 'rated' && item.metadata?.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(item.metadata.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    )}

                    {item.action === 'converted' && item.metadata?.taskId && (
                      <div className="mt-2">
                        <Badge variant="outline">
                          Task #{item.metadata.taskId.slice(0, 8)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to build history from work request data
export function buildApprovalHistory(request: {
  id: string;
  created_at: string;
  submitted_at?: string;
  first_response_at?: string;
  resolved_at?: string;
  converted_task_id?: string;
  csat_rating?: number;
  csat_submitted_at?: string;
  requester?: { id: string; full_name: string; avatar_url?: string };
  assigned_to_profile?: { id: string; full_name: string; avatar_url?: string };
  approval_history?: any[];
  status: string;
  triage_notes?: string;
}): ApprovalHistoryItem[] {
  const history: ApprovalHistoryItem[] = [];

  // Created
  if (request.requester) {
    history.push({
      id: `${request.id}-created`,
      action: 'created',
      timestamp: request.created_at,
      user: {
        id: request.requester.id,
        name: request.requester.full_name,
        avatar: request.requester.avatar_url,
      },
    });
  }

  // Submitted
  if (request.submitted_at && request.requester) {
    history.push({
      id: `${request.id}-submitted`,
      action: 'submitted',
      timestamp: request.submitted_at,
      user: {
        id: request.requester.id,
        name: request.requester.full_name,
        avatar: request.requester.avatar_url,
      },
    });
  }

  // Assigned
  if (request.assigned_to_profile && request.first_response_at) {
    history.push({
      id: `${request.id}-assigned`,
      action: 'assigned',
      timestamp: request.first_response_at,
      user: {
        id: request.assigned_to_profile.id,
        name: request.assigned_to_profile.full_name,
        avatar: request.assigned_to_profile.avatar_url,
      },
      metadata: { assignee: request.assigned_to_profile.full_name },
    });
  }

  // Approved/Rejected
  if (request.resolved_at && request.assigned_to_profile) {
    const isApproved = request.status === 'completed' || request.status === 'approved';
    history.push({
      id: `${request.id}-resolved`,
      action: isApproved ? 'approved' : 'rejected',
      timestamp: request.resolved_at,
      user: {
        id: request.assigned_to_profile.id,
        name: request.assigned_to_profile.full_name,
        avatar: request.assigned_to_profile.avatar_url,
      },
      details: request.triage_notes,
    });
  }

  // Converted
  if (request.converted_task_id && request.assigned_to_profile) {
    history.push({
      id: `${request.id}-converted`,
      action: 'converted',
      timestamp: request.resolved_at || new Date().toISOString(),
      user: {
        id: request.assigned_to_profile.id,
        name: request.assigned_to_profile.full_name,
        avatar: request.assigned_to_profile.avatar_url,
      },
      metadata: { taskId: request.converted_task_id },
    });
  }

  // CSAT Rating
  if (request.csat_rating && request.csat_submitted_at && request.requester) {
    history.push({
      id: `${request.id}-rated`,
      action: 'rated',
      timestamp: request.csat_submitted_at,
      user: {
        id: request.requester.id,
        name: request.requester.full_name,
        avatar: request.requester.avatar_url,
      },
      metadata: { rating: request.csat_rating },
    });
  }

  // Add any custom history items
  if (request.approval_history && Array.isArray(request.approval_history)) {
    history.push(...request.approval_history);
  }

  // Sort by timestamp
  return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
