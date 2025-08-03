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
  const { data: analyticsData, isLoading: analyticsLoading } = useInternAnalytics(internProfile?.user_id || '');
  const [showCertificateGenerator, setShowCertificateGenerator] = useState(false);

  if (!currentProfile || currentProfile.role !== 'admin') {
    return null;
  }

  // Filter data using correct user_id from profile
  const internTasks = tasks.filter(task => task.assigned_to === internProfile?.user_id);
  const internTimeLogs = timeLogs.filter(log => log.user_id === internProfile?.user_id);

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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time">Time Logs</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
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

            {/* Performance Stats - Enhanced Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData?.totalStats.totalSessions || 0}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Created:</span>
                    <span className="text-sm">{analyticsData?.totalStats.accountCreatedDate ? format(new Date(analyticsData.totalStats.accountCreatedDate), 'MMM dd, yyyy') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Login:</span>
                    <span className="text-sm">{analyticsData?.totalStats.lastLoginDate ? format(new Date(analyticsData.totalStats.lastLoginDate), 'MMM dd, yyyy') : 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Admin Notes:</span>
                    <span className="text-sm font-medium">{analyticsData?.totalStats.adminNotes || 0}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Session Hours:</span>
                    <span className="text-sm font-medium">{Math.round((analyticsData?.totalStats.totalSessionHours || 0) * 10) / 10}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Session Duration:</span>
                    <span className="text-sm font-medium">{analyticsData?.totalStats.averageSessionDuration || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Activity Logs:</span>
                    <span className="text-sm font-medium">{analyticsData?.totalStats.activityLogs || 0}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Training & Assessments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Training Progress:</span>
                    <span className="text-sm font-medium">{analyticsData?.totalStats.trainingProgress || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assessments Passed:</span>
                    <span className="text-sm font-medium text-green-600">{analyticsData?.totalStats.assessmentsPassed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assessments Failed:</span>
                    <span className="text-sm font-medium text-red-600">{analyticsData?.totalStats.assessmentsFailed || 0}</span>
                  </div>
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

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Session Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Login and logout activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {analyticsData?.detailedData?.sessionLogs?.slice(0, 10).map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(session.login_time), 'MMM dd, yyyy HH:mm')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.logout_time ? `Duration: ${session.session_duration_minutes} min` : 'Active session'}
                          </p>
                        </div>
                        <Badge variant={session.logout_time ? "outline" : "default"}>
                          {session.logout_time ? "Completed" : "Active"}
                        </Badge>
                      </div>
                    )) || <p className="text-muted-foreground">No session data available</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Recent user activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {analyticsData?.detailedData?.activityLogs?.slice(0, 10).map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">Activity logged</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">No activity data available</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Statistics</CardTitle>
                <CardDescription>Email notifications and admin interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded">
                    <p className="text-2xl font-bold">{analyticsData?.totalStats.emailsSent || 0}</p>
                    <p className="text-sm text-muted-foreground">Email Notifications Sent</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded">
                    <p className="text-2xl font-bold">{analyticsData?.totalStats.adminNotes || 0}</p>
                    <p className="text-sm text-muted-foreground">Admin Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Training Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>Course completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData?.detailedData?.trainingProgress?.map((progress: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{progress.progress_type}</p>
                          <p className="text-xs text-muted-foreground">Progress Value: {progress.progress_value}%</p>
                        </div>
                        <Badge variant="outline">{progress.progress_value}%</Badge>
                      </div>
                    )) || <p className="text-muted-foreground">No training progress data</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Results</CardTitle>
                  <CardDescription>Test scores and completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analyticsData?.detailedData?.assessmentAttempts?.map((attempt: any) => (
                      <div key={attempt.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">Assessment Attempt</p>
                          <p className="text-xs text-muted-foreground">Status: {attempt.status}</p>
                        </div>
                        <Badge variant={attempt.is_passed ? "default" : "destructive"}>
                          {attempt.is_passed ? "Passed" : "Failed"}
                        </Badge>
                      </div>
                    )) || <p className="text-muted-foreground">No assessment attempts</p>}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <p className="text-lg font-bold text-green-600">{analyticsData?.totalStats.assessmentsPassed || 0}</p>
                      <p className="text-xs text-green-600">Passed</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <p className="text-lg font-bold text-red-600">{analyticsData?.totalStats.assessmentsFailed || 0}</p>
                      <p className="text-xs text-red-600">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificate">
            <CertificateGenerator internData={internProfile} onClose={() => setShowCertificateGenerator(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}