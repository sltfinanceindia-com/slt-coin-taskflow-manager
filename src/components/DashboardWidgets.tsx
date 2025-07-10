
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Clock, Target, TrendingUp, Calendar, Award, GraduationCap } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useUIUXExams } from '@/hooks/useUIUXExams';

export function DashboardWidgets() {
  const { profile } = useAuth();
  const { stats } = useProfile();
  const { tasks } = useTasks();
  const { getWeeklyHours } = useTimeLogs();
  const { attempts } = useUIUXExams();

  const myTasks = tasks.filter(task => task.assigned_to === profile?.id);
  const pendingTasks = myTasks.filter(task => 
    task.status === 'assigned' || task.status === 'in_progress'
  );

  const weeklyHours = getWeeklyHours();

  // Calculate exam statistics from attempts
  const completedExams = attempts.filter(attempt => attempt.completed_at);
  const averageScore = completedExams.length > 0 
    ? completedExams.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions * 100), 0) / completedExams.length
    : 0;
  const latestExam = completedExams[0]; // Most recent exam

  const widgets = [
    {
      title: 'SLT Coins Earned',
      value: stats?.totalCoins || 0,
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      change: '+12 this week',
      trending: true,
    },
    {
      title: 'Hours This Week',
      value: weeklyHours,
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      change: `Goal: 40h`,
      progress: Math.min((weeklyHours / 40) * 100, 100),
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks.length,
      icon: Target,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      change: `${myTasks.length} total`,
      urgent: pendingTasks.some(task => task.priority === 'urgent'),
    },
    {
      title: 'Exam Average',
      value: `${Math.round(averageScore)}%`,
      icon: GraduationCap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      change: `${completedExams.length} completed`,
      progress: averageScore,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((widget, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{widget.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{widget.value}</p>
                    {widget.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {widget.trending && <TrendingUp className="h-3 w-3" />}
                    {widget.change}
                  </p>
                  {widget.progress !== undefined && (
                    <Progress value={widget.progress} className="h-1" />
                  )}
                </div>
                <div className={`p-3 rounded-full ${widget.bgColor}`}>
                  <widget.icon className={`h-6 w-6 ${widget.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {task.slt_coin_value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {myTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Exam Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestExam && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Latest Exam</span>
                    <Badge 
                      variant={latestExam.is_passed ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      {latestExam.is_passed ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score: {latestExam.score}/{latestExam.total_questions}</span>
                      <span className="text-muted-foreground">
                        {new Date(latestExam.completed_at!).toLocaleDateString()}
                      </span>
                    </div>
                    <Progress 
                      value={(latestExam.score / latestExam.total_questions) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Average</span>
                  <span>{Math.round(averageScore)}%</span>
                </div>
                <Progress value={averageScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Completed</span>
                  <p className="font-medium">{completedExams.length}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Passed</span>
                  <p className="font-medium">{completedExams.filter(e => e.is_passed).length}</p>
                </div>
              </div>

              {completedExams.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No exams completed yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
