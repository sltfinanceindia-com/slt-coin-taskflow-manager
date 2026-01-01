import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Target, Plus, Calendar, CheckCircle, Circle, XCircle, ChevronRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface PersonalGoal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', icon: Circle, color: 'bg-slate-500' },
  in_progress: { label: 'In Progress', icon: ChevronRight, color: 'bg-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function PersonalGoalsWidget() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PersonalGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Fetch goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['personal-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_goals')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PersonalGoal[];
    },
    enabled: !!profile?.id,
  });

  // Create goal mutation
  const createGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('personal_goals').insert({
        user_id: profile?.id,
        title: formData.title,
        description: formData.description || null,
        target_date: formData.target_date || null,
        priority: formData.priority,
        organization_id: profile?.organization_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
      toast.success('Goal created successfully!');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create goal');
    },
  });

  // Update progress mutation
  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
      const { error } = await supabase
        .from('personal_goals')
        .update({ progress, status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });

  // Delete goal mutation
  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('personal_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
      toast.success('Goal deleted');
    },
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', target_date: '', priority: 'medium' });
    setEditingGoal(null);
  };

  const activeGoals = goals.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Personal Goals</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Personal Goal</DialogTitle>
                <DialogDescription>
                  Set a personal goal to track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Title</label>
                  <Input
                    placeholder="Enter your goal"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    placeholder="Add more details..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Date</label>
                    <Input
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createGoal.mutate()}
                  disabled={!formData.title || createGoal.isPending}
                >
                  {createGoal.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          {activeGoals.length} active • {completedGoals.length} completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active goals</p>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setIsDialogOpen(true)}
            >
              Create your first goal
            </Button>
          </div>
        ) : (
          activeGoals.slice(0, 5).map((goal) => {
            const statusConfig = STATUS_CONFIG[goal.status];
            const StatusIcon = statusConfig.icon;
            return (
              <div
                key={goal.id}
                className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{goal.title}</h4>
                      <Badge className={`text-xs ${PRIORITY_COLORS[goal.priority]}`}>
                        {goal.priority}
                      </Badge>
                    </div>
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        Due {format(new Date(goal.target_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteGoal.mutate(goal.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Slider
                    value={[goal.progress]}
                    max={100}
                    step={5}
                    className="w-full"
                    onValueChange={([value]) => 
                      updateProgress.mutate({ id: goal.id, progress: value })
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
