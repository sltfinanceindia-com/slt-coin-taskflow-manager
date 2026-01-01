import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTaskClone } from '@/hooks/useTaskClone';
import { Task } from '@/types/task';

interface TaskCloneDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCloneDialog({ task, open, onOpenChange }: TaskCloneDialogProps) {
  const { profile } = useAuth();
  const { cloneTask, isCloning } = useTaskClone();
  
  const [newTitle, setNewTitle] = useState(`${task.title} (Copy)`);
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [includeChecklists, setIncludeChecklists] = useState(true);

  const { data: employees } = useQuery({
    queryKey: ['assignable-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('organization_id', profile.organization_id)
        .in('role', ['intern', 'employee'])
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && open,
  });

  const handleClone = () => {
    cloneTask({
      task,
      options: {
        newTitle,
        newAssignee: newAssignee || undefined,
        includeSubtasks,
        includeChecklists,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Clone Task
          </DialogTitle>
          <DialogDescription>
            Create a copy of this task with optional modifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="clone-title">New Task Title</Label>
            <Input
              id="clone-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title..."
            />
          </div>

          <div className="space-y-2">
            <Label>Assign To (Optional)</Label>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Keep original assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Keep original assignee</SelectItem>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Clone Options</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-subtasks"
                checked={includeSubtasks}
                onCheckedChange={(checked) => setIncludeSubtasks(!!checked)}
              />
              <Label htmlFor="include-subtasks" className="cursor-pointer font-normal">
                Include subtasks
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-checklists"
                checked={includeChecklists}
                onCheckedChange={(checked) => setIncludeChecklists(!!checked)}
              />
              <Label htmlFor="include-checklists" className="cursor-pointer font-normal">
                Include checklists
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={isCloning || !newTitle.trim()}>
            {isCloning ? 'Cloning...' : 'Clone Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
