import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useObjectives, useKeyResults } from '@/hooks/usePerformanceManagement';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Plus, Target, ChevronDown, ChevronRight, Building2, Users, User, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function OKRManagement() {
  const { objectives, isLoading, createObjective, updateObjective, deleteObjective } = useObjectives();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner_id: '',
    level: 'individual' as 'company' | 'team' | 'individual',
    quarter: '',
    year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
  });

  const handleSubmit = async () => {
    await createObjective.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      owner_id: '',
      level: 'individual',
      quarter: '',
      year: new Date().getFullYear(),
      start_date: '',
      end_date: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
      not_started: { variant: 'secondary', label: 'Not Started' },
      on_track: { variant: 'default', label: 'On Track', className: 'bg-green-500' },
      at_risk: { variant: 'default', label: 'At Risk', className: 'bg-yellow-500' },
      behind: { variant: 'destructive', label: 'Behind' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'secondary', label: 'Cancelled' },
    };
    const config = variants[status] || variants.not_started;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const filteredObjectives = objectives.filter((o: any) => 
    selectedLevel === 'all' || o.level === selectedLevel
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OKRs & Goals</h1>
          <p className="text-muted-foreground">
            Set objectives and track key results across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Objective
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Objective</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Increase customer satisfaction"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the objective"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Level</Label>
                    <Select value={formData.level} onValueChange={(v: any) => setFormData({ ...formData, level: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <Select value={formData.owner_id} onValueChange={(v) => setFormData({ ...formData, owner_id: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quarter</Label>
                    <Select value={formData.quarter} onValueChange={(v) => setFormData({ ...formData, quarter: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} disabled={createObjective.isPending} className="w-full">
                  Create Objective
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filteredObjectives.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Objectives Yet</h3>
            <p className="text-muted-foreground">Create your first objective to start tracking progress.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredObjectives.map((objective: any) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onUpdate={updateObjective.mutateAsync}
              onDelete={deleteObjective.mutateAsync}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ObjectiveCard({ objective, onUpdate, onDelete, isAdmin }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const { keyResults, createKeyResult, updateKeyResult } = useKeyResults(objective.id);
  const [krDialogOpen, setKrDialogOpen] = useState(false);
  const [krFormData, setKrFormData] = useState({
    title: '',
    description: '',
    target_value: 100,
    unit: '%',
    due_date: '',
  });

  const handleCreateKR = async () => {
    await createKeyResult.mutateAsync({
      objective_id: objective.id,
      ...krFormData,
    });
    setKrDialogOpen(false);
    setKrFormData({ title: '', description: '', target_value: 100, unit: '%', due_date: '' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      not_started: { variant: 'secondary' },
      on_track: { variant: 'default', className: 'bg-green-500' },
      at_risk: { variant: 'default', className: 'bg-yellow-500' },
      behind: { variant: 'destructive' },
      completed: { variant: 'outline' },
    };
    const config = variants[status] || variants.not_started;
    return <Badge variant={config.variant} className={config.className}>{status.replace('_', ' ')}</Badge>;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getLevelIcon(objective.level)}
                    {objective.title}
                    {getStatusBadge(objective.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={objective.owner?.avatar_url} />
                      <AvatarFallback>{objective.owner?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {objective.owner?.full_name}
                    {objective.quarter && ` • ${objective.quarter} ${objective.year}`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{objective.progress_percentage}%</div>
                  <Progress value={objective.progress_percentage} className="w-24 h-2" />
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t pt-4">
            {objective.description && (
              <p className="text-muted-foreground mb-4">{objective.description}</p>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Key Results</h4>
                <Dialog open={krDialogOpen} onOpenChange={setKrDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Key Result
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Key Result</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={krFormData.title}
                          onChange={(e) => setKrFormData({ ...krFormData, title: e.target.value })}
                          placeholder="Increase NPS score to 50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Target Value</Label>
                          <Input
                            type="number"
                            value={krFormData.target_value}
                            onChange={(e) => setKrFormData({ ...krFormData, target_value: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Input
                            value={krFormData.unit}
                            onChange={(e) => setKrFormData({ ...krFormData, unit: e.target.value })}
                            placeholder="%, count, $"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <Input
                          type="date"
                          value={krFormData.due_date}
                          onChange={(e) => setKrFormData({ ...krFormData, due_date: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateKR} disabled={createKeyResult.isPending} className="w-full">
                        Add Key Result
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {objective.key_results?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No key results defined yet.</p>
              ) : (
                <div className="space-y-3">
                  {objective.key_results?.map((kr: any) => (
                    <div key={kr.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{kr.title}</span>
                          {getStatusBadge(kr.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <Progress value={(kr.current_value / kr.target_value) * 100} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {kr.current_value} / {kr.target_value} {kr.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(objective.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Objective
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
