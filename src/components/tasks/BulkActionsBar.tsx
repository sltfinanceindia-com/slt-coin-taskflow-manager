import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { X, Trash2, CheckCircle, Flag, UserPlus } from 'lucide-react';
import { useBulkTaskActions } from '@/hooks/useBulkTaskActions';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkActionsBarProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedTaskIds, onClearSelection }: BulkActionsBarProps) {
  const { profile } = useAuth();
  const { bulkUpdate, bulkDelete, isUpdating, isDeleting } = useBulkTaskActions();
  const [statusValue, setStatusValue] = useState('');
  const [priorityValue, setPriorityValue] = useState('');
  const [assigneeValue, setAssigneeValue] = useState('');

  const { data: employees } = useQuery({
    queryKey: ['assignable-employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('organization_id', profile.organization_id)
        .in('role', ['intern', 'employee'])
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const handleStatusChange = (value: string) => {
    setStatusValue(value);
    bulkUpdate({ taskIds: selectedTaskIds, field: 'status', value });
    onClearSelection();
  };

  const handlePriorityChange = (value: string) => {
    setPriorityValue(value);
    bulkUpdate({ taskIds: selectedTaskIds, field: 'priority', value });
    onClearSelection();
  };

  const handleAssigneeChange = (value: string) => {
    setAssigneeValue(value);
    bulkUpdate({ taskIds: selectedTaskIds, field: 'assigned_to', value });
    onClearSelection();
  };

  const handleDelete = () => {
    bulkDelete(selectedTaskIds);
    onClearSelection();
  };

  if (selectedTaskIds.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-3"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded">
            {selectedTaskIds.length}
          </span>
          <span className="text-muted-foreground">selected</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Select value={statusValue} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-[130px]">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityValue} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-8 w-[120px]">
              <Flag className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeValue} onValueChange={handleAssigneeChange}>
            <SelectTrigger className="h-8 w-[140px]">
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-8">
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedTaskIds.length} tasks?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All selected tasks and their subtasks will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="h-6 w-px bg-border" />

        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8">
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
}
