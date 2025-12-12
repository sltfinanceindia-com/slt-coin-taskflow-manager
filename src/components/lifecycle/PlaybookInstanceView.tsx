import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlaybooks, LifecycleInstance } from '@/hooks/usePlaybooks';
import { useAssets } from '@/hooks/useAssets';
import { AssetTracker } from './AssetTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, User, 
  Package, XCircle, FileCheck
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface PlaybookInstanceViewProps {
  instance: LifecycleInstance;
  onClose: () => void;
}

export const PlaybookInstanceView: React.FC<PlaybookInstanceViewProps> = ({
  instance,
  onClose
}) => {
  const { useInstanceItems, completeItem, completeInstance, cancelInstance } = usePlaybooks();
  const { data: items = [], isLoading } = useInstanceItems(instance.id);
  const { activeAssets } = useAssets(instance.employee_id);
  
  const completedCount = items.filter(i => i.completed_at).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;
  const noUnreturnedAssets = activeAssets.length === 0;
  
  const isOffboarding = instance.playbook?.type === 'offboarding';

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleToggleItem = (itemId: string, completed: boolean) => {
    if (!completed) {
      completeItem.mutate({ itemId });
    }
  };

  const handleCompleteInstance = () => {
    completeInstance.mutate(instance.id);
    onClose();
  };

  const handleCancelInstance = () => {
    cancelInstance.mutate(instance.id);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={instance.employee?.avatar_url} />
              <AvatarFallback>
                {instance.employee?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">
                {instance.employee?.full_name || 'Unknown Employee'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {instance.playbook?.name}
              </p>
            </div>
            <Badge 
              className="ml-auto"
              variant={instance.status === 'completed' ? 'default' : 
                       instance.status === 'cancelled' ? 'destructive' : 'secondary'}
            >
              {instance.status === 'completed' && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {instance.status === 'cancelled' && <XCircle className="mr-1 h-3 w-3" />}
              {instance.status === 'in_progress' && <Clock className="mr-1 h-3 w-3" />}
              {instance.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} tasks completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {format(new Date(instance.started_at), 'MMM d, yyyy')}
              </div>
              {instance.target_completion_date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Target: {format(new Date(instance.target_completion_date), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="checklist" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="checklist" className="flex-1">
                <FileCheck className="mr-2 h-4 w-4" />
                Checklist
              </TabsTrigger>
              {isOffboarding && (
                <TabsTrigger value="assets" className="flex-1">
                  <Package className="mr-2 h-4 w-4" />
                  Assets ({activeAssets.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="checklist" className="mt-4">
              <ScrollArea className="h-[350px] pr-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {category}
                        </h4>
                        <div className="space-y-2">
                          {categoryItems.map(item => {
                            const isCompleted = !!item.completed_at;
                            const isOverdue = item.due_date && 
                              new Date(item.due_date) < new Date() && 
                              !isCompleted;
                            
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "flex items-start gap-3 rounded-md border p-3 transition-colors",
                                  isCompleted && "bg-muted/50",
                                  isOverdue && "border-destructive/50"
                                )}
                              >
                                <Checkbox
                                  checked={isCompleted}
                                  disabled={isCompleted || instance.status !== 'in_progress'}
                                  onCheckedChange={() => handleToggleItem(item.id, isCompleted)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "font-medium",
                                    isCompleted && "line-through text-muted-foreground"
                                  )}>
                                    {item.item_title}
                                  </p>
                                  {item.item_description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {item.item_description}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {item.assignee_role && (
                                      <Badge variant="outline" className="text-xs">
                                        <User className="mr-1 h-3 w-3" />
                                        {item.assignee_role}
                                      </Badge>
                                    )}
                                    {item.due_date && (
                                      <span className={cn(
                                        "text-xs",
                                        isOverdue ? "text-destructive" : "text-muted-foreground"
                                      )}>
                                        {isOverdue && <AlertCircle className="inline mr-1 h-3 w-3" />}
                                        Due: {format(new Date(item.due_date), 'MMM d')}
                                      </span>
                                    )}
                                    {isCompleted && item.completed_at && (
                                      <span className="text-xs text-green-600">
                                        <CheckCircle2 className="inline mr-1 h-3 w-3" />
                                        Completed {formatDistanceToNow(new Date(item.completed_at), { addSuffix: true })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {isOffboarding && (
              <TabsContent value="assets" className="mt-4">
                <ScrollArea className="h-[350px]">
                  <AssetTracker employeeId={instance.employee_id} />
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>

          {/* Actions */}
          {instance.status === 'in_progress' && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="destructive" size="sm" onClick={handleCancelInstance}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleCompleteInstance}
                disabled={!allComplete || (isOffboarding && !noUnreturnedAssets)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete {isOffboarding ? 'Offboarding' : 'Onboarding'}
              </Button>
            </div>
          )}
          
          {instance.status === 'in_progress' && isOffboarding && !noUnreturnedAssets && allComplete && (
            <p className="text-sm text-destructive text-center">
              All assets must be returned before completing offboarding
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
