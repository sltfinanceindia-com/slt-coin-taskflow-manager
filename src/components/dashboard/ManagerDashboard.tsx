/**
 * Manager Dashboard
 * Shows manager-specific widgets: Team Overview, Pending Approvals, Team Attendance
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, CheckCircle, Clock, FileCheck, AlertCircle, ArrowRight,
  UserCheck, UserX, Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, parseISO } from 'date-fns';

export function ManagerDashboard() {
  const { profile } = useAuth();

  // Fetch team members (direct reports)
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department, role, is_active')
        .eq('reporting_manager_id', profile?.id)
        .eq('organization_id', profile?.organization_id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id && !!profile?.organization_id,
  });

  // Fetch pending approvals (leave requests)
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['pending-approvals', profile?.id],
    queryFn: async () => {
      const teamIds = teamMembers.map(m => m.id);
      if (teamIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, profiles:employee_id(full_name, avatar_url)')
        .in('employee_id', teamIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: teamMembers.length > 0,
  });

  // Fetch team attendance for today
  const { data: teamAttendance = [] } = useQuery({
    queryKey: ['team-attendance', profile?.id],
    queryFn: async () => {
      const teamIds = teamMembers.map(m => m.id);
      if (teamIds.length === 0) return [];
      
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*, profiles:employee_id(full_name, avatar_url)')
        .in('employee_id', teamIds)
        .eq('attendance_date', today);
      
      if (error) throw error;
      return data || [];
    },
    enabled: teamMembers.length > 0,
  });

  // Fetch team tasks
  const { data: teamTasks = [] } = useQuery({
    queryKey: ['team-tasks', profile?.id],
    queryFn: async () => {
      const teamIds = teamMembers.map(m => m.id);
      if (teamIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:assigned_to(full_name)')
        .in('assigned_to', teamIds)
        .neq('status', 'completed')
        .neq('status', 'verified')
        .order('end_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: teamMembers.length > 0,
  });

  const presentCount = teamAttendance.filter(a => a.status === 'present').length;
  const absentCount = teamMembers.length - presentCount;
  const attendanceRate = teamMembers.length > 0 
    ? Math.round((presentCount / teamMembers.length) * 100) 
    : 0;

  const navigateToTab = (tab: string) => {
    const event = new CustomEvent('navigate-to-tab', { detail: { tab } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold">Team Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage your team&apos;s performance, approvals, and attendance
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {teamMembers.filter(m => m.is_active).length} active
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold">{presentCount}</p>
                <Progress value={attendanceRate} className="h-1.5 mt-2" />
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                <p className="text-xs text-muted-foreground">
                  Needs your action
                </p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <FileCheck className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
                <p className="text-2xl font-bold">{teamTasks.length}</p>
                <p className="text-xs text-muted-foreground">
                  Team-wide
                </p>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <CheckCircle className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Attendance Today */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Team Attendance Today
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('attendance')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">Present: {presentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm">Absent: {absentCount}</span>
            </div>
          </div>
          
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {teamMembers.slice(0, 6).map(member => {
                const attendance = teamAttendance.find(a => a.employee_id === member.id);
                const isPresent = attendance?.status === 'present';
                
                return (
                  <div 
                    key={member.id} 
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isPresent ? 'bg-success/10' : 'bg-muted/50'
                    }`}
                  >
                    <Avatar className="h-10 w-10 mb-2">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium text-center truncate w-full">
                      {member.full_name?.split(' ')[0]}
                    </p>
                    <Badge 
                      variant={isPresent ? 'default' : 'secondary'} 
                      className="text-[10px] mt-1"
                    >
                      {isPresent ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No team members assigned
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Pending Approvals
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive">{pendingApprovals.length}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('approvals')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map((approval: any) => (
                <div 
                  key={approval.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={approval.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {approval.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{approval.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {approval.leave_type} • {format(parseISO(approval.start_date), 'MMM d')} - {format(parseISO(approval.end_date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Leave Request</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No pending approvals
            </p>
          )}
        </CardContent>
      </Card>

      {/* Team Tasks */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Team Tasks
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigateToTab('tasks')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {teamTasks.length > 0 ? (
            <div className="space-y-3">
              {teamTasks.slice(0, 5).map((task: any) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {task.profiles?.full_name}
                      </span>
                      {task.end_date && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            Due {format(parseISO(task.end_date), 'MMM d')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              No active team tasks
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
