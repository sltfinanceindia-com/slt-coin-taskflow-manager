import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

interface TimeLogDialogProps {
  onLogTime: (logData: {
    task_id: string;
    hours_worked: number;
    date_logged: string;
    description?: string;
  }) => void;
  isLogging: boolean;
}

export function TimeLogDialog({ onLogTime, isLogging }: TimeLogDialogProps) {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    task_id: '',
    hours_worked: 1,
    date_logged: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Filter tasks assigned to current user that are not completed/verified/rejected
  const availableTasks = tasks.filter(task => 
    task.assigned_to === profile?.id && 
    ['assigned', 'in_progress'].includes(task.status)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.task_id || formData.hours_worked <= 0) return;

    onLogTime(formData);
    setOpen(false);
    setFormData({
      task_id: '',
      hours_worked: 1,
      date_logged: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="animate-scale-in">
          <Clock className="h-4 w-4 mr-2" />
          Log Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <span>Log Working Hours</span>
          </DialogTitle>
          <DialogDescription>
            Track the time you've spent working on your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Task *</Label>
            <Select 
              value={formData.task_id} 
              onValueChange={(value) => setFormData({ ...formData, task_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked *</Label>
              <Input
                id="hours"
                type="number"
                min="0.25"
                max="24"
                step="0.25"
                value={formData.hours_worked}
                onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_logged}
                onChange={(e) => setFormData({ ...formData, date_logged: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you work on?"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLogging}>
              {isLogging ? "Logging..." : "Log Hours"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}