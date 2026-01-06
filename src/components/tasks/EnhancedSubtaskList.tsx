import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  CheckCircle2,
  Circle,
  Clock,
  User,
  Calendar as CalendarIcon,
  GripVertical
} from 'lucide-react';

interface EnhancedSubtaskListProps {
  parentTaskId: string;
  readOnly?: boolean;
}

const statusConfig = {
  assigned: { icon: Circle, color: 'text-blue-500', bg: 'bg-blue-100' },
  in_progress: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100' },
  verified: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' },
};

export function EnhancedSubtaskList({ parentTaskId, readOnly = false }: EnhancedSubtaskListProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch subtasks with full details
  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ['enhanced-subtasks', parentTaskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_profile:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)
        `)
        .eq('parent_task_id', parentTaskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!parentTaskId,
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ['org-employees', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile?.organization_id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Create subtask mutation
  const createSubtask = useMutation({
    mutationFn: async (data: { title: string; assigned_to?: string; end_date?: string }) => {
      // Get parent task details first
      const { data: parentTask, error: parentError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', parentTaskId)
        .single();

      if (parentError) throw parentError;

      const { error } = await supabase.from('tasks').insert({
        title: data.title,
        description: '',
        parent_task_id: parentTaskId,
        project_id: parentTask.project_id,
        organization_id: parentTask.organization_id,
        assigned_to: data.assigned_to || parentTask.assigned_to,
        created_by: profile?.id,
        priority: parentTask.priority,
        status: 'assigned',
        slt_coin_value: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: data.end_date || parentTask.end_date,
        completion_percentage: 0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['task-subtasks-stats', parentTaskId] });
      setNewSubtaskTitle('');
      setIsAdding(false);
      toast.success('Subtask created');
    },
    onError: (error) => {
      toast.error('Failed to create subtask: ' + error.message);
    },
  });

  // Update subtask mutation
  const updateSubtask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['task-subtasks-stats', parentTaskId] });
    },
    onError: (error) => {
      toast.error('Failed to update subtask: ' + error.message);
    },
  });

  // Delete subtask mutation
  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-subtasks', parentTaskId] });
      queryClient.invalidateQueries({ queryKey: ['task-subtasks-stats', parentTaskId] });
      toast.success('Subtask deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete subtask: ' + error.message);
    },
  });

  const completedCount = subtasks.filter(s => s.status === 'completed' || s.status === 'verified').length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    createSubtask.mutate({ title: newSubtaskTitle.trim() });
  };

  const cycleStatus = (subtask: any) => {
    const statusOrder = ['assigned', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(subtask.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateSubtask.mutate({ 
      id: subtask.id, 
      updates: { 
        status: nextStatus,
        completion_percentage: nextStatus === 'completed' ? 100 : subtask.completion_percentage
      } 
    });
  };

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-2 h-auto">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium">Subtasks</span>
            <Badge variant="secondary">
              {completedCount}/{subtasks.length}
            </Badge>
          </div>
          {subtasks.length > 0 && (
            <span className="text-sm text-muted-foreground">{progress}%</span>
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 pt-2">
        {/* Subtask List */}
        {subtasks.map((subtask) => {
          const StatusIcon = statusConfig[subtask.status as keyof typeof statusConfig]?.icon || Circle;
          const statusColor = statusConfig[subtask.status as keyof typeof statusConfig]?.color || 'text-gray-500';

          return (
            <div 
              key={subtask.id} 
              className="group flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              {/* Status Toggle */}
              <button
                onClick={() => !readOnly && cycleStatus(subtask)}
                className={`mt-0.5 ${statusColor} hover:opacity-80 transition-opacity`}
                disabled={readOnly}
              >
                <StatusIcon className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-sm ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => deleteSubtask.mutate(subtask.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Progress Slider */}
                <div className="flex items-center gap-3">
                  <Slider
                    value={[subtask.completion_percentage || 0]}
                    onValueChange={([value]) => {
                      if (!readOnly) {
                        updateSubtask.mutate({ 
                          id: subtask.id, 
                          updates: { 
                            completion_percentage: value,
                            status: value === 100 ? 'completed' : (value > 0 ? 'in_progress' : 'assigned')
                          } 
                        });
                      }
                    }}
                    max={100}
                    step={5}
                    disabled={readOnly}
                    className="flex-1"
                  />
                  <span className="text-xs font-medium w-10 text-right">
                    {subtask.completion_percentage || 0}%
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Assignee */}
                  <Select
                    value={subtask.assigned_to || ''}
                    onValueChange={(value) => {
                      if (!readOnly) {
                        updateSubtask.mutate({ id: subtask.id, updates: { assigned_to: value } });
                      }
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger className="h-7 w-auto gap-2 text-xs">
                      {subtask.assigned_profile ? (
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={subtask.assigned_profile.avatar_url} />
                            <AvatarFallback className="text-[8px]">
                              {subtask.assigned_profile.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-[100px] truncate">
                            {subtask.assigned_profile.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Assign</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={emp.avatar_url} />
                              <AvatarFallback className="text-[10px]">
                                {emp.full_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {emp.full_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Due Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 text-xs"
                        disabled={readOnly}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {subtask.end_date 
                          ? format(parseISO(subtask.end_date), 'MMM dd')
                          : 'No due date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={subtask.end_date ? parseISO(subtask.end_date) : undefined}
                        onSelect={(date) => {
                          if (date && !readOnly) {
                            updateSubtask.mutate({ 
                              id: subtask.id, 
                              updates: { end_date: format(date, 'yyyy-MM-dd') } 
                            });
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Subtask */}
        {!readOnly && (
          <div className="pt-2">
            {isAdding ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Subtask title..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewSubtaskTitle('');
                    }
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={handleAddSubtask}
                  disabled={createSubtask.isPending || !newSubtaskTitle.trim()}
                >
                  Add
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setIsAdding(false);
                    setNewSubtaskTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add subtask
              </Button>
            )}
          </div>
        )}

        {subtasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No subtasks yet
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
