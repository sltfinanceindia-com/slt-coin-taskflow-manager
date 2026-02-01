/**
 * Project Team Tab
 * Team members, roles, resource allocation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTeamTabProps {
  projectId: string;
}

export function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
  // Get team members from tasks
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project-team', projectId],
    queryFn: async () => {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('assigned_to, profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, department, role)')
        .eq('project_id', projectId)
        .not('assigned_to', 'is', null);

      // Get unique team members
      const membersMap = new Map<string, any>();
      tasks?.forEach((task: any) => {
        if (task.profiles && !membersMap.has(task.profiles.id)) {
          membersMap.set(task.profiles.id, {
            ...task.profiles,
            taskCount: 1,
          });
        } else if (task.profiles) {
          const existing = membersMap.get(task.profiles.id);
          existing.taskCount++;
        }
      });

      return Array.from(membersMap.values());
    },
  });

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Members Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>People assigned to this project</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No team members assigned yet</p>
              <p className="text-sm mt-1">Assign tasks to add team members</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback>{member.full_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {member.role?.replace('_', ' ') || 'Member'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {member.taskCount} task(s)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
