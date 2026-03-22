import { useState, useMemo } from 'react';
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
import { Plus, Target, ChevronDown, ChevronRight, Building2, Users, User, Trash2, Download, Link2, Edit2, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { exportToCSV, formatDateForExport } from '@/lib/export';
import { Checkbox } from '@/components/ui/checkbox';

export function OKRManagement() {
  const { objectives, isLoading, createObjective, updateObjective, deleteObjective } = useObjectives();
  const { profile } = useAuth();
  const { isAdmin } = useUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Fixed: Add organization_id filter to prevent cross-org data leakage
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
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
          <Card key={i} className="animate-pulse">
            <CardContent className="py-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Export OKRs to CSV
  const handleExportOKRs = () => {
    const exportData = filteredObjectives.map((obj: any) => ({
      title: obj.title,
      description: obj.description || '',
      level: obj.level,
      status: obj.status,
      progress: obj.progress_percentage,
      owner: obj.owner?.full_name || 'Unassigned',
      quarter: obj.quarter || '',
      year: obj.year,
      start_date: formatDateForExport(obj.start_date),
      end_date: formatDateForExport(obj.end_date),
      key_results_count: obj.key_results?.length || 0,
    }));

    exportToCSV(exportData, 'okrs', [
      { key: 'title', label: 'Objective' },
      { key: 'description', label: 'Description' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status' },
      { key: 'progress', label: 'Progress %' },
      { key: 'owner', label: 'Owner' },
      { key: 'quarter', label: 'Quarter' },
      { key: 'year', label: 'Year' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'key_results_count', label: 'Key Results' },
    ]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">OKRs & Goals</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Set objectives and track key results across your organization
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm h-9 sm:h-10">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportOKRs} disabled={filteredObjectives.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

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
  const [editingKrId, setEditingKrId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [linkDialogKrId, setLinkDialogKrId] = useState<string | null>(null);
  const { profile } = useAuth();
  const [krFormData, setKrFormData] = useState({
    title: '',
    description: '',
    target_value: 100,
    unit: '%',
    due_date: '',
  });

  // Fetch tasks for linking
  const { data: orgTasks = [] } = useQuery({
    queryKey: ['tasks-for-okr', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && linkDialogKrId !== null,
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
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0">
                {isOpen ? <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-0" /> : <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 sm:mt-0" />}
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    {getLevelIcon(objective.level)}
                    <span className="truncate">{objective.title}</span>
                    {getStatusBadge(objective.status)}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-xs sm:text-sm">
                    <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                      <AvatarImage src={objective.owner?.avatar_url} />
                      <AvatarFallback className="text-[10px] sm:text-xs">{objective.owner?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{objective.owner?.full_name}</span>
                    {objective.quarter && <span className="hidden sm:inline">• {objective.quarter} {objective.year}</span>}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 pl-6 sm:pl-0">
                <div className="text-right">
                  <div className="text-lg sm:text-2xl font-bold">{objective.progress_percentage}%</div>
                  <Progress value={objective.progress_percentage} className="w-16 sm:w-24 h-1.5 sm:h-2" />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  {objective.key_results?.map((kr: any) => {
                    const linkedCount = kr.linked_task_ids?.length || 0;
                    const isEditing = editingKrId === kr.id;
                    
                    return (
                      <div key={kr.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium">{kr.title}</span>
                            {getStatusBadge(kr.status)}
                            {linkedCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Link2 className="h-3 w-3 mr-1" />
                                {linkedCount} tasks
                              </Badge>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                    className="w-20 h-7 text-sm"
                                  />
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                    onClick={() => {
                                      updateKeyResult.mutate({ id: kr.id, current_value: editValue });
                                      setEditingKrId(null);
                                    }}>
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                  onClick={() => { setEditingKrId(kr.id); setEditValue(kr.current_value); }}>
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                onClick={() => setLinkDialogKrId(kr.id)}>
                                <Link2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={(kr.current_value / kr.target_value) * 100} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {kr.current_value} / {kr.target_value} {kr.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Task Link Dialog */}
              <Dialog open={linkDialogKrId !== null} onOpenChange={(open) => !open && setLinkDialogKrId(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Tasks to Key Result</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {orgTasks.map((task: any) => {
                      const currentKr = objective.key_results?.find((kr: any) => kr.id === linkDialogKrId);
                      const isLinked = currentKr?.linked_task_ids?.includes(task.id) || false;
                      return (
                        <div key={task.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                          <Checkbox
                            checked={isLinked}
                            onCheckedChange={(checked) => {
                              const currentIds = currentKr?.linked_task_ids || [];
                              const newIds = checked
                                ? [...currentIds, task.id]
                                : currentIds.filter((id: string) => id !== task.id);
                              updateKeyResult.mutate({ id: linkDialogKrId!, linked_task_ids: newIds } as any);
                            }}
                          />
                          <span className="text-sm flex-1">{task.title}</span>
                          <Badge variant="outline" className="text-xs">{task.status}</Badge>
                        </div>
                      );
                    })}
                    {orgTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks available</p>}
                  </div>
                </DialogContent>
              </Dialog>

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
