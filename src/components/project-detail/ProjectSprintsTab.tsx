/**
 * Project Sprints Tab
 * Active sprint, sprint backlog, upcoming sprints
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Plus, Play, Pause } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInDays } from 'date-fns';

interface ProjectSprintsTabProps {
  projectId: string;
}

export function ProjectSprintsTab({ projectId }: ProjectSprintsTabProps) {
  const { data: sprints = [] } = useQuery({
    queryKey: ['project-sprints', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const activeSprint = sprints.find((s: any) => s.status === 'active');
  const upcomingSprints = sprints.filter((s: any) => s.status === 'planned');
  const completedSprints = sprints.filter((s: any) => s.status === 'completed');

  const getSprintProgress = (sprint: any) => {
    if (!sprint.start_date || !sprint.end_date) return 0;
    const total = differenceInDays(parseISO(sprint.end_date), parseISO(sprint.start_date));
    const elapsed = differenceInDays(new Date(), parseISO(sprint.start_date));
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {/* Active Sprint */}
      {activeSprint ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  Active Sprint: {activeSprint.name}
                </CardTitle>
                <CardDescription>
                  {format(parseISO(activeSprint.start_date), 'MMM dd')} - {format(parseISO(activeSprint.end_date), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Sprint Progress</span>
                  <span className="font-medium">{getSprintProgress(activeSprint)}%</span>
                </div>
                <Progress value={getSprintProgress(activeSprint)} className="h-2" />
              </div>
              {activeSprint.goal && (
                <div>
                  <span className="text-sm font-medium">Sprint Goal</span>
                  <p className="text-sm text-muted-foreground mt-1">{activeSprint.goal}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sprint</p>
              <Button className="mt-4" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Start New Sprint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Sprints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Sprints</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSprints.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No upcoming sprints planned</p>
          ) : (
            <div className="space-y-3">
              {upcomingSprints.map((sprint: any) => (
                <div key={sprint.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{sprint.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(sprint.start_date), 'MMM dd')} - {format(parseISO(sprint.end_date), 'MMM dd')}
                    </p>
                  </div>
                  <Badge variant="outline">Planned</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Sprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedSprints.slice(0, 5).map((sprint: any) => (
                <div key={sprint.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{sprint.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(sprint.start_date), 'MMM dd')} - {format(parseISO(sprint.end_date), 'MMM dd')}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30">Completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
