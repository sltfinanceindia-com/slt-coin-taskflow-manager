/**
 * Decision Log
 * Filter view for decision comments
 */

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityComments } from '@/hooks/useEntityComments';
import {
  Flag,
  CheckCircle,
  Calendar,
  User,
} from 'lucide-react';

interface DecisionLogProps {
  entityType: string;
  entityId: string;
  title?: string;
  className?: string;
}

export function DecisionLog({ 
  entityType, 
  entityId, 
  title = 'Decision Log',
  className,
}: DecisionLogProps) {
  const { comments, isLoading } = useEntityComments(entityType as any, entityId);
  
  // Filter only decision comments
  const decisions = (comments || []).filter(c => c.is_decision);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flag className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {decisions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          {decisions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="mx-auto h-8 w-8 opacity-50" />
              <p className="mt-2 text-sm">No decisions recorded</p>
              <p className="text-xs">Mark comments as decisions to track them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((decision) => (
                <div 
                  key={decision.id}
                  className="p-4 rounded-lg border bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-orange-100 dark:bg-orange-900/50">
                      <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium whitespace-pre-wrap">
                        {decision.content}
                      </p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{decision.user?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(decision.created_at), 'MMM d, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
