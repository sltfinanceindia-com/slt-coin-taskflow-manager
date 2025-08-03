import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Award, Clock, FileText, Eye, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { useInternAnalytics } from '@/hooks/useInternAnalytics';
import { CertificateGenerator } from '@/components/CertificateGenerator';
import { format } from 'date-fns';
import { SimpleBarChart, SimpleLineChart } from '@/components/SimpleChart';

interface InternDetailViewProps {
  internId: string;
  onClose: () => void;
}

export function InternDetailView({ internId, onClose }: InternDetailViewProps) {
  const { profile: currentProfile } = useAuth();
  const { profile: internProfile, stats } = useProfile(internId);
  const { tasks } = useTasks();
  const { timeLogs } = useTimeLogs();
  const { data: analyticsData, isLoading: analyticsLoading } = useInternAnalytics(internId);
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false);

  if (!currentProfile || currentProfile.role !== 'admin') {
    return null;
  }

  const internTasks = tasks.filter(task => task.assigned_to === internId);
  const internTimeLogs = timeLogs.filter(log => log.user_id === internId);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {internProfile?.full_name} - Intern Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time Logs</TabsTrigger>
            <TabsTrigger value="certificate">Certificate</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{internProfile?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{internProfile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{internProfile?.employee_id || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{internProfile?.department || 'Not set'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.totalTasks || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.completedTasks || 0}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.totalHours || 0}h</p>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.totalComments || 0}</p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.totalCoins || 0}</p>
                  <p className="text-sm text-muted-foreground">SLT Coins</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analyticsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Weekly Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Weekly Task Completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SimpleBarChart 
                        data={analyticsData?.weeklyData.slice(-8) || []}
                        dataKey="tasksCompleted"
                        xAxisKey="week"
                        height={200}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        Weekly Hours Logged
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SimpleLineChart 
                        data={analyticsData?.weeklyData.slice(-8) || []}
                        dataKey="totalHours"
                        xAxisKey="week"
                        height={200}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Performance Breakdown</CardTitle>
                    <CardDescription>Detailed weekly performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Week</th>
                            <th className="text-center p-2">Tasks</th>
                            <th className="text-center p-2">Hours</th>
                            <th className="text-center p-2">Comments</th>
                            <th className="text-center p-2">Coins</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData?.weeklyData.slice(-12).reverse().map((week, index) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-medium">{week.week}</td>
                              <td className="text-center p-2">{week.tasksCompleted}</td>
                              <td className="text-center p-2">{week.totalHours}h</td>
                              <td className="text-center p-2">{week.commentsAdded}</td>
                              <td className="text-center p-2">{week.coinsEarned}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task History</CardTitle>
                <CardDescription>All tasks assigned to this intern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {internTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No tasks assigned yet</p>
                  ) : (
                    internTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(task.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                          <p className="text-sm text-muted-foreground mt-1">{task.slt_coin_value} coins</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>Hours logged by this intern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {internTimeLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No time logs yet</p>
                  ) : (
                    internTimeLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{log.task?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(log.date_logged), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{log.hours_worked}h</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificate">
            <CertificateGenerator internData={internProfile} onClose={() => setShowCertificateGenerator(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}