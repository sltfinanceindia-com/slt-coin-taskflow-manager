import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWorkloadScenarios, ScenarioData, ResourceChange, DeadlineShift, NewProject } from '@/hooks/useWorkloadScenarios';
import { Plus, Trash2, Users, Calendar, Briefcase, Calculator, Loader2 } from 'lucide-react';

interface WhatIfScenarioBuilderProps {
  onScenarioCreated?: () => void;
}

export function WhatIfScenarioBuilder({ onScenarioCreated }: WhatIfScenarioBuilderProps) {
  const { createScenario, isCreating } = useWorkloadScenarios();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scenarioData, setScenarioData] = useState<ScenarioData>({
    resource_changes: [],
    deadline_shifts: [],
    new_projects: []
  });

  const addResourceChange = () => {
    setScenarioData(prev => ({
      ...prev,
      resource_changes: [...prev.resource_changes, {
        profile_id: '',
        profile_name: '',
        hours_change: 40,
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }]
    }));
  };

  const updateResourceChange = (index: number, field: keyof ResourceChange, value: any) => {
    setScenarioData(prev => ({
      ...prev,
      resource_changes: prev.resource_changes.map((rc, i) => 
        i === index ? { ...rc, [field]: value } : rc
      )
    }));
  };

  const removeResourceChange = (index: number) => {
    setScenarioData(prev => ({
      ...prev,
      resource_changes: prev.resource_changes.filter((_, i) => i !== index)
    }));
  };

  const addDeadlineShift = () => {
    setScenarioData(prev => ({
      ...prev,
      deadline_shifts: [...prev.deadline_shifts, {
        project_id: '',
        project_name: '',
        days_shift: 14
      }]
    }));
  };

  const updateDeadlineShift = (index: number, field: keyof DeadlineShift, value: any) => {
    setScenarioData(prev => ({
      ...prev,
      deadline_shifts: prev.deadline_shifts.map((ds, i) => 
        i === index ? { ...ds, [field]: value } : ds
      )
    }));
  };

  const removeDeadlineShift = (index: number) => {
    setScenarioData(prev => ({
      ...prev,
      deadline_shifts: prev.deadline_shifts.filter((_, i) => i !== index)
    }));
  };

  const addNewProject = () => {
    setScenarioData(prev => ({
      ...prev,
      new_projects: [...prev.new_projects, {
        name: '',
        hours: 100,
        start_date: new Date().toISOString().split('T')[0]
      }]
    }));
  };

  const updateNewProject = (index: number, field: keyof NewProject, value: any) => {
    setScenarioData(prev => ({
      ...prev,
      new_projects: prev.new_projects.map((np, i) => 
        i === index ? { ...np, [field]: value } : np
      )
    }));
  };

  const removeNewProject = (index: number) => {
    setScenarioData(prev => ({
      ...prev,
      new_projects: prev.new_projects.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = () => {
    createScenario({
      name,
      description,
      scenario_data: scenarioData
    }, {
      onSuccess: () => {
        setOpen(false);
        setName('');
        setDescription('');
        setScenarioData({ resource_changes: [], deadline_shifts: [], new_projects: [] });
        onScenarioCreated?.();
      }
    });
  };

  const totalChanges = 
    scenarioData.resource_changes.length + 
    scenarioData.deadline_shifts.length + 
    scenarioData.new_projects.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create What-If Scenario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create What-If Scenario</DialogTitle>
          <DialogDescription>
            Model resource changes, deadline shifts, and new projects to forecast impact
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Scenario Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Add 2 developers in Q2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>

          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resources" className="text-xs sm:text-sm">
                <Users className="h-4 w-4 mr-1 hidden sm:inline" />
                Resources ({scenarioData.resource_changes.length})
              </TabsTrigger>
              <TabsTrigger value="deadlines" className="text-xs sm:text-sm">
                <Calendar className="h-4 w-4 mr-1 hidden sm:inline" />
                Deadlines ({scenarioData.deadline_shifts.length})
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm">
                <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                Projects ({scenarioData.new_projects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Add or remove capacity by adjusting weekly hours
              </p>
              {scenarioData.resource_changes.map((change, idx) => (
                <Card key={idx} className="border-muted">
                  <CardContent className="p-4 grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Resource Name</Label>
                      <Input
                        value={change.profile_name || ''}
                        onChange={(e) => updateResourceChange(idx, 'profile_name', e.target.value)}
                        placeholder="New hire / Team member"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hours/Week</Label>
                      <Input
                        type="number"
                        value={change.hours_change}
                        onChange={(e) => updateResourceChange(idx, 'hours_change', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeResourceChange(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">From</Label>
                      <Input
                        type="date"
                        value={change.effective_from}
                        onChange={(e) => updateResourceChange(idx, 'effective_from', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Until</Label>
                      <Input
                        type="date"
                        value={change.effective_until}
                        onChange={(e) => updateResourceChange(idx, 'effective_until', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addResourceChange}>
                <Plus className="h-4 w-4 mr-1" /> Add Resource Change
              </Button>
            </TabsContent>

            <TabsContent value="deadlines" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Shift project deadlines forward or backward
              </p>
              {scenarioData.deadline_shifts.map((shift, idx) => (
                <Card key={idx} className="border-muted">
                  <CardContent className="p-4 grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Project Name</Label>
                      <Input
                        value={shift.project_name || ''}
                        onChange={(e) => updateDeadlineShift(idx, 'project_name', e.target.value)}
                        placeholder="Project name"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Days Shift</Label>
                        <Input
                          type="number"
                          value={shift.days_shift}
                          onChange={(e) => updateDeadlineShift(idx, 'days_shift', parseInt(e.target.value))}
                          placeholder="+14 or -7"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeDeadlineShift(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addDeadlineShift}>
                <Plus className="h-4 w-4 mr-1" /> Add Deadline Shift
              </Button>
            </TabsContent>

            <TabsContent value="projects" className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Model new projects that might be added
              </p>
              {scenarioData.new_projects.map((project, idx) => (
                <Card key={idx} className="border-muted">
                  <CardContent className="p-4 grid gap-3 sm:grid-cols-4">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs">Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateNewProject(idx, 'name', e.target.value)}
                        placeholder="New project name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total Hours</Label>
                      <Input
                        type="number"
                        value={project.hours}
                        onChange={(e) => updateNewProject(idx, 'hours', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeNewProject(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Start Date</Label>
                      <Input
                        type="date"
                        value={project.start_date}
                        onChange={(e) => updateNewProject(idx, 'start_date', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={addNewProject}>
                <Plus className="h-4 w-4 mr-1" /> Add New Project
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalChanges} change{totalChanges !== 1 ? 's' : ''} configured
          </div>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name || isCreating}>
            {isCreating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Calculator className="h-4 w-4 mr-2" /> Create Scenario</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
