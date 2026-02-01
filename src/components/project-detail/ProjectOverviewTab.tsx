/**
 * Project Overview Tab
 * Project header, key metrics, description, milestones
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Target, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ProjectOverviewTabProps {
  project: any;
  stats: any;
}

export function ProjectOverviewTab({ project, stats }: ProjectOverviewTabProps) {
  const progressPercent = stats?.totalTasks 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {project.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>

      {/* Key Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.owner && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Owner</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.owner.avatar_url || ''} />
                    <AvatarFallback>{project.owner.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{project.owner.full_name}</span>
                </div>
              </div>
            )}
            {project.manager && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Manager</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.manager.avatar_url || ''} />
                    <AvatarFallback>{project.manager.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{project.manager.full_name}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Priority</span>
              <Badge variant="outline" className="capitalize">{project.priority || 'Medium'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className="capitalize">{project.status?.replace('_', ' ')}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {project.start_date ? format(parseISO(project.start_date), 'MMM dd, yyyy') : 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Target End</span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {project.end_date ? format(parseISO(project.end_date), 'MMM dd, yyyy') : 'Not set'}
              </span>
            </div>
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Case */}
      {project.business_case && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Case</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.business_case}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
