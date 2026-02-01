/**
 * Project Timeline Tab
 * Gantt chart view, milestones, dependencies
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface ProjectTimelineTabProps {
  projectId: string;
}

export function ProjectTimelineTab({ projectId }: ProjectTimelineTabProps) {
  const { data: milestones = [] } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Gantt
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </CardTitle>
          <CardDescription>Key project milestones and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No milestones defined</p>
              <Button className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Milestone
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {milestones.map((milestone: any) => (
                  <div key={milestone.id} className="relative flex gap-4 pl-10">
                    <div className="absolute left-2 p-1.5 rounded-full bg-primary text-primary-foreground">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{milestone.name}</p>
                        <span className="text-sm text-muted-foreground">
                          {milestone.due_date 
                            ? format(parseISO(milestone.due_date), 'MMM dd, yyyy')
                            : 'No date'}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gantt Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gantt Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gantt chart visualization</p>
            <p className="text-sm mt-1">Timeline view of tasks and dependencies</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
