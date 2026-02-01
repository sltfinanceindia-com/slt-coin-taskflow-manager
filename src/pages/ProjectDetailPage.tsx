/**
 * Project Detail Page - Full 9-Tab Structure
 * Route: /projects/:id
 * Tabs: Overview, Team, Tasks, Sprints, Timeline, Files, Budget, Reports, Settings
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, Target, Users, CheckSquare, Timer, 
  Calendar, FileText, DollarSign, BarChart3, Settings,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

// Tab Components
import { ProjectOverviewTab } from '@/components/project-detail/ProjectOverviewTab';
import { ProjectTeamTab } from '@/components/project-detail/ProjectTeamTab';
import { ProjectTasksTab } from '@/components/project-detail/ProjectTasksTab';
import { ProjectSprintsTab } from '@/components/project-detail/ProjectSprintsTab';
import { ProjectTimelineTab } from '@/components/project-detail/ProjectTimelineTab';
import { ProjectFilesTab } from '@/components/project-detail/ProjectFilesTab';
import { ProjectBudgetTab } from '@/components/project-detail/ProjectBudgetTab';
import { ProjectReportsTab } from '@/components/project-detail/ProjectReportsTab';
import { ProjectSettingsTab } from '@/components/project-detail/ProjectSettingsTab';

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const healthColors: Record<string, string> = {
  green: 'text-green-600 dark:text-green-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red: 'text-red-600 dark:text-red-400',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isAdmin, isManager } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(id, full_name, avatar_url),
          manager:profiles!projects_manager_id_fkey(id, full_name, avatar_url),
          program:programs(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch project stats
  const { data: projectStats } = useQuery({
    queryKey: ['project-stats', id],
    queryFn: async () => {
      if (!id) return null;
      
      // Get task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status, assigned_to')
        .eq('project_id', id);

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => ['completed', 'verified'].includes(t.status)).length || 0;
      const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;

      // Get unique team members
      const teamMembers = new Set(tasks?.map(t => t.assigned_to).filter(Boolean));

      // Get sprint count
      const { data: sprints } = await supabase
        .from('sprints')
        .select('id, status')
        .eq('project_id', id);

      const activeSprints = sprints?.filter(s => s.status === 'active').length || 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        teamMemberCount: teamMembers.size,
        activeSprints,
        totalSprints: sprints?.length || 0,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <Button onClick={() => navigate('/dashboard?tab=projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const progressPercent = projectStats?.totalTasks 
    ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100) 
    : 0;

  const budgetUsed = project.budget > 0 
    ? Math.round(((project.spent_budget || 0) / project.budget) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{project.name}</h1>
                  <Badge className={statusColors[project.status] || ''}>
                    {project.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {project.program && <span>{(project.program as any).name}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {project.priority && (
                <Badge variant="outline" className="capitalize">
                  {project.priority} priority
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Target className="h-4 w-4" />
                Progress
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{progressPercent}%</div>
                <Progress value={progressPercent} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckSquare className="h-4 w-4" />
                Tasks
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {projectStats?.completedTasks || 0}/{projectStats?.totalTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                Team
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{projectStats?.teamMemberCount || 0}</div>
                <p className="text-xs text-muted-foreground">members</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <DollarSign className="h-4 w-4" />
                Budget
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{budgetUsed}%</div>
                <p className="text-xs text-muted-foreground">
                  ${(project.spent_budget || 0).toLocaleString()} / ${(project.budget || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Timer className="h-4 w-4" />
                Sprints
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{projectStats?.activeSprints || 0}</div>
                <p className="text-xs text-muted-foreground">active of {projectStats?.totalSprints || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 9-Tab Structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full h-auto flex-wrap gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Team</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Tasks</span>
                {projectStats?.totalTasks ? (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {projectStats.totalTasks}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="sprints" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Sprints</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Files</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Budget</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs sm:text-sm min-h-[44px]">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <ProjectOverviewTab project={project} stats={projectStats} />
          </TabsContent>
          <TabsContent value="team">
            <ProjectTeamTab projectId={id!} />
          </TabsContent>
          <TabsContent value="tasks">
            <ProjectTasksTab projectId={id!} />
          </TabsContent>
          <TabsContent value="sprints">
            <ProjectSprintsTab projectId={id!} />
          </TabsContent>
          <TabsContent value="timeline">
            <ProjectTimelineTab projectId={id!} />
          </TabsContent>
          <TabsContent value="files">
            <ProjectFilesTab projectId={id!} />
          </TabsContent>
          <TabsContent value="budget">
            <ProjectBudgetTab project={project} />
          </TabsContent>
          <TabsContent value="reports">
            <ProjectReportsTab projectId={id!} />
          </TabsContent>
          <TabsContent value="settings">
            <ProjectSettingsTab project={project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
