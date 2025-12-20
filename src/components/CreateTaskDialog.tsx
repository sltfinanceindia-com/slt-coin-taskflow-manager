import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Coins, X, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { validateTaskData } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateTaskDialogProps {
  onCreateTask: (taskData: {
    title: string;
    description: string;
    assigned_to: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    slt_coin_value: number;
    start_date: string;
    end_date: string;
  }) => void;
  isCreating: boolean;
}

export function CreateTaskDialog({ onCreateTask, isCreating }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    slt_coin_value: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const { profile } = useAuth();

  // Fetch employee profiles (including interns) from the same organization
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
    enabled: !!profile?.organization_id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validate task data
    const validation = validateTaskData({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      slt_coin_value: formData.slt_coin_value
    });

    const errors = [...validation.errors];

    // Additional validations
    if (formData.assigned_to.length === 0) {
      errors.push('At least one employee must be assigned to the task');
    }

    if (!formData.end_date) {
      errors.push('Due date is required');
    }

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      errors.push('Due date must be after start date');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Use sanitized data
    onCreateTask({
      ...formData,
      title: validation.sanitizedData.title || formData.title,
      description: validation.sanitizedData.description || formData.description,
    });
    
    setOpen(false);
    setValidationErrors([]);
    setFormData({
      title: '',
      description: '',
      assigned_to: [],
      priority: 'medium',
      slt_coin_value: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(employeeId) 
        ? prev.assigned_to.filter(id => id !== employeeId)
        : [...prev.assigned_to, employeeId]
    }));
  };

  const removeEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.filter(id => id !== employeeId)
    }));
  };

  const getEmployeeName = (employeeId: string) => {
    return employees?.find(emp => emp.id === employeeId)?.full_name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-scale-in">
          <Plus className="h-4 w-4 mr-2" />
          Create New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-coin-gold" />
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Create a new task and assign SLT Coins as reward for completion.
          </DialogDescription>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task requirements..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign to Employees *</Label>
              <div className="space-y-3">
                {/* Selected Employees */}
                {formData.assigned_to.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.assigned_to.map(employeeId => (
                        <Badge key={employeeId} variant="secondary" className="flex items-center gap-1">
                          {getEmployeeName(employeeId)}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeEmployee(employeeId)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Employee Selection */}
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {employees?.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 min-h-[44px] py-1">
                      <Checkbox
                        id={employee.id}
                        checked={formData.assigned_to.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeToggle(employee.id)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={employee.id} className="flex-1 cursor-pointer text-sm">
                        {employee.full_name}
                      </Label>
                    </div>
                  ))}
                  {(!employees || employees.length === 0) && (
                    <p className="text-sm text-muted-foreground py-2">No employees available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coins">SLT Coin Reward *</Label>
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-coin-gold shrink-0" />
              <Input
                id="coins"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000"
                value={formData.slt_coin_value}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFormData({ ...formData, slt_coin_value: Math.min(Math.max(value, 0), 1000) });
                }}
                className="flex-1 min-h-[44px]"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Max 1000 coins per task</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="min-h-[44px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Due Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                required
                className="min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="min-h-[44px]">
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="min-h-[44px]">
              {isCreating ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}