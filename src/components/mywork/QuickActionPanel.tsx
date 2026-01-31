/**
 * Quick Action Panel
 * Inline actions for work items
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { WorkItem } from '@/hooks/useMyWork';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { 
  Clock, 
  MessageSquare, 
  ArrowRight,
  CheckCircle,
  Zap,
} from 'lucide-react';

interface QuickActionPanelProps {
  selectedItemId: string | null;
  items: WorkItem[];
  onActionComplete: () => void;
}

export function QuickActionPanel({ selectedItemId, items, onActionComplete }: QuickActionPanelProps) {
  const [timeMinutes, setTimeMinutes] = useState('');
  const [timeDescription, setTimeDescription] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  
  const { logTime } = useTimeLogs();
  const { updateTask } = useTasks();

  const selectedItem = items.find(item => item.id === selectedItemId);

  const handleLogTime = async () => {
    if (!selectedItem || !timeMinutes) return;
    if (selectedItem.type !== 'task') {
      toast.error('Time logging is only available for tasks');
      return;
    }

    setIsLogging(true);
    try {
      logTime({
        task_id: selectedItem.id,
        hours_worked: parseInt(timeMinutes, 10) / 60, // Convert minutes to hours
        date_logged: new Date().toISOString().split('T')[0],
        description: timeDescription || undefined,
      });
      setTimeMinutes('');
      setTimeDescription('');
      onActionComplete();
      toast.success('Time logged successfully');
    } catch (error) {
      toast.error('Failed to log time');
    } finally {
      setIsLogging(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedItem || !newStatus) return;
    if (selectedItem.type !== 'task') {
      toast.error('Status change is only available for tasks');
      return;
    }

    try {
      updateTask(selectedItem.id, { status: newStatus as 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected' });
      setNewStatus('');
      onActionComplete();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const taskStatuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
  ];

  if (!selectedItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 opacity-50" />
            <p className="mt-4 text-sm">
              Select a work item to see available actions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {selectedItem.title}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Log Time */}
        {selectedItem.type === 'task' && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Log Time
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Minutes"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="What did you work on?"
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
                className="flex-1"
              />
            </div>
            <Button 
              onClick={handleLogTime} 
              disabled={!timeMinutes || isLogging}
              size="sm"
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </div>
        )}

        {selectedItem.type === 'task' && <Separator />}

        {/* Change Status */}
        {selectedItem.type === 'task' && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <ArrowRight className="h-4 w-4" />
              Change Status
            </Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {taskStatuses.map(status => (
                  <SelectItem 
                    key={status.value} 
                    value={status.value}
                    disabled={status.value === selectedItem.status}
                  >
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleStatusChange} 
              disabled={!newStatus}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        )}

        {/* Item Info */}
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{selectedItem.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">{selectedItem.status.replace('_', ' ')}</span>
          </div>
          {selectedItem.priority && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Priority</span>
              <span className="font-medium capitalize">{selectedItem.priority}</span>
            </div>
          )}
          {selectedItem.project && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium truncate max-w-[150px]">{selectedItem.project.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
