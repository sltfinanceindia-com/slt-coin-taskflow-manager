import React, { useState } from 'react';
import { useSkills, Skill, EmployeeSkill, CreateSkillData, AssignSkillData } from '@/hooks/useSkills';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { GraduationCap, Plus, Trash2, Star, Award, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const PROFICIENCY_LABELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
const SKILL_CATEGORIES = ['Technical', 'Design', 'Management', 'Communication', 'Domain', 'Tools', 'General'];

export function SkillsMatrix() {
  const { profile } = useAuth();
  const {
    skills,
    employeeSkills,
    skillsByCategory,
    skillsByEmployee,
    isLoading,
    createSkill,
    deleteSkill,
    assignSkill,
    removeEmployeeSkill,
    isCreating,
    isAssigning,
  } = useSkills();

  const [activeTab, setActiveTab] = useState('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [skillForm, setSkillForm] = useState<CreateSkillData>({ name: '', category: 'Technical', description: '' });
  const [assignForm, setAssignForm] = useState<AssignSkillData>({ profile_id: '', skill_id: '', proficiency_level: 3 });

  // Get all profiles for assignment
  const { data: profiles } = useQuery({
    queryKey: ['profiles-for-skills', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name');
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    createSkill(skillForm, {
      onSuccess: () => {
        setIsSkillDialogOpen(false);
        setSkillForm({ name: '', category: 'Technical', description: '' });
      },
    });
  };

  const handleAssignSkill = (e: React.FormEvent) => {
    e.preventDefault();
    assignSkill(assignForm, {
      onSuccess: () => {
        setIsAssignDialogOpen(false);
        setAssignForm({ profile_id: '', skill_id: '', proficiency_level: 3 });
      },
    });
  };

  const getProficiencyColor = (level: number) => {
    const colors = [
      'bg-gray-200 text-gray-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-purple-100 text-purple-700',
    ];
    return colors[level - 1] || colors[0];
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              Skills Matrix
            </CardTitle>
            <CardDescription>
              Manage team skills and proficiency levels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Skill</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Skill</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSkill} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      placeholder="e.g., React, Python, Project Management"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={skillForm.category}
                      onValueChange={(v) => setSkillForm({ ...skillForm, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      value={skillForm.description || ''}
                      onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                      placeholder="Brief description of this skill"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsSkillDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Skill'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Assign Skill</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Skill to Employee</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignSkill} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select
                      value={assignForm.profile_id}
                      onValueChange={(v) => setAssignForm({ ...assignForm, profile_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles?.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Skill</Label>
                    <Select
                      value={assignForm.skill_id}
                      onValueChange={(v) => setAssignForm({ ...assignForm, skill_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skills.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <Button
                          key={level}
                          type="button"
                          variant={assignForm.proficiency_level === level ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setAssignForm({ ...assignForm, proficiency_level: level })}
                          className="flex-1"
                        >
                          {level}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {PROFICIENCY_LABELS[assignForm.proficiency_level - 1]}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isAssigning || !assignForm.profile_id || !assignForm.skill_id}>
                      {isAssigning ? 'Assigning...' : 'Assign Skill'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matrix">Matrix View</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="employees">By Employee</TabsTrigger>
            </TabsList>

            <div className="my-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="matrix" className="mt-0">
              {skills.length === 0 || !profiles?.length ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No Skills Matrix"
                  description="Add skills and assign them to employees to build your skills matrix"
                  actionLabel="Add Skill"
                  onAction={() => setIsSkillDialogOpen(true)}
                />
              ) : (
                <ScrollArea className="w-full">
                  <div className="min-w-[600px]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium sticky left-0 bg-background">Employee</th>
                          {filteredSkills.map(skill => (
                            <th key={skill.id} className="p-3 font-medium text-center min-w-[80px]">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="cursor-default">
                                    <span className="truncate block max-w-[80px]">{skill.name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{skill.name}</p>
                                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profiles?.map(emp => {
                          const empSkills = skillsByEmployee[emp.id] || [];
                          return (
                            <tr key={emp.id} className="border-b hover:bg-accent/5">
                              <td className="p-3 sticky left-0 bg-background">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={emp.avatar_url || ''} />
                                    <AvatarFallback className="text-xs">
                                      {emp.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium truncate max-w-[120px]">{emp.full_name}</span>
                                </div>
                              </td>
                              {filteredSkills.map(skill => {
                                const empSkill = empSkills.find(es => es.skill_id === skill.id);
                                return (
                                  <td key={skill.id} className="p-3 text-center">
                                    {empSkill ? (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <Badge className={getProficiencyColor(empSkill.proficiency_level)}>
                                              {empSkill.proficiency_level}
                                              {empSkill.is_certified && <Award className="h-3 w-3 ml-1" />}
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{PROFICIENCY_LABELS[empSkill.proficiency_level - 1]}</p>
                                            {empSkill.is_certified && <p className="text-xs">Certified</p>}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              {Object.keys(skillsByCategory).length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No Skills"
                  description="Add skills to track team competencies"
                  actionLabel="Add Skill"
                  onAction={() => setIsSkillDialogOpen(true)}
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                    <div key={category}>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Badge variant="outline">{category}</Badge>
                        <span className="text-muted-foreground text-sm">({catSkills.length})</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catSkills
                          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(skill => {
                            const skillEmployees = employeeSkills.filter(es => es.skill_id === skill.id);
                            return (
                              <Card key={skill.id} className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">{skill.name}</h4>
                                    {skill.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {skillEmployees.length} employee{skillEmployees.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Skill?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will remove the skill and all employee assignments.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteSkill(skill.id)}
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="employees" className="mt-0">
              <div className="space-y-4">
                {profiles?.map(emp => {
                  const empSkills = skillsByEmployee[emp.id] || [];
                  return (
                    <Card key={emp.id} className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarImage src={emp.avatar_url || ''} />
                          <AvatarFallback>
                            {emp.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{emp.full_name}</h4>
                          <p className="text-xs text-muted-foreground">{empSkills.length} skills</p>
                        </div>
                      </div>
                      {empSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {empSkills.map(es => (
                            <Badge key={es.id} variant="secondary" className="gap-1">
                              {es.skill?.name}
                              <span className="text-muted-foreground">L{es.proficiency_level}</span>
                              {es.is_certified && <Award className="h-3 w-3" />}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills assigned</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t flex flex-wrap gap-3 text-xs">
            {PROFICIENCY_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <Badge className={`${getProficiencyColor(i + 1)} text-xs`}>{i + 1}</Badge>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
