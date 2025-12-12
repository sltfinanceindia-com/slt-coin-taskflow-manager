import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSLAMetrics } from '@/hooks/useSLAMetrics';
import { useWorkRequests } from '@/hooks/useWorkRequests';
import { 
  Clock, CheckCircle2, AlertTriangle, XCircle, 
  TrendingUp, Star, Timer, BarChart3 
} from 'lucide-react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function MetricCard({ title, value, subtitle, icon, trend, trendValue, variant = 'default' }: MetricCardProps) {
  const variantClasses = {
    default: 'bg-card',
    success: 'bg-green-500/10 border-green-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    danger: 'bg-red-500/10 border-red-500/20',
  };

  return (
    <Card className={`${variantClasses[variant]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-full bg-muted/50">
            {icon}
          </div>
        </div>
        {trend && trendValue && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <TrendingUp className={`h-3 w-3 ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`} />
            <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SLATimer({ dueDate, isResolved }: { dueDate: string; isResolved: boolean }) {
  const now = new Date();
  const due = new Date(dueDate);
  const isBreached = !isResolved && now > due;
  const hoursRemaining = differenceInHours(due, now);
  const minutesRemaining = differenceInMinutes(due, now) % 60;

  if (isResolved) {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Resolved
      </Badge>
    );
  }

  if (isBreached) {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Breached
      </Badge>
    );
  }

  if (hoursRemaining < 4) {
    return (
      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {hoursRemaining}h {minutesRemaining}m left
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
      <Timer className="h-3 w-3 mr-1" />
      {hoursRemaining}h left
    </Badge>
  );
}

export function SLADashboard() {
  const { metrics, feedback, isLoading } = useSLAMetrics();
  const { requests, breaches } = useWorkRequests();
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalRequests = metrics?.total_requests || 0;
  const responseSLARate = totalRequests > 0 
    ? Math.round(((metrics?.response_sla_met || 0) / totalRequests) * 100) 
    : 0;
  const resolutionSLARate = totalRequests > 0 
    ? Math.round(((metrics?.resolution_sla_met || 0) / totalRequests) * 100) 
    : 0;

  // Get active requests with SLA timers
  const activeRequests = requests?.filter(r => 
    !['completed', 'cancelled', 'rejected'].includes(r.status)
  ) || [];

  const urgentRequests = activeRequests.filter(r => {
    if (!r.sla_resolution_due) return false;
    const hoursRemaining = differenceInHours(new Date(r.sla_resolution_due), new Date());
    return hoursRemaining < 8 && hoursRemaining > 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">SLA Performance Dashboard</h2>
        <p className="text-sm text-muted-foreground">Monitor SLA compliance, response times, and customer satisfaction</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="csat">CSAT</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Requests"
              value={totalRequests}
              subtitle="Last 30 days"
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Response SLA"
              value={`${responseSLARate}%`}
              subtitle={`${metrics?.response_sla_met || 0} met`}
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              variant={responseSLARate >= 90 ? 'success' : responseSLARate >= 70 ? 'warning' : 'danger'}
            />
            <MetricCard
              title="Resolution SLA"
              value={`${resolutionSLARate}%`}
              subtitle={`${metrics?.resolution_sla_met || 0} met`}
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              variant={resolutionSLARate >= 90 ? 'success' : resolutionSLARate >= 70 ? 'warning' : 'danger'}
            />
            <MetricCard
              title="Avg CSAT"
              value={metrics?.avg_csat_rating?.toFixed(1) || 'N/A'}
              subtitle="out of 5.0"
              icon={<Star className="h-5 w-5 text-yellow-500" />}
              variant={(metrics?.avg_csat_rating || 0) >= 4 ? 'success' : (metrics?.avg_csat_rating || 0) >= 3 ? 'warning' : 'danger'}
            />
          </div>

          {/* SLA Compliance Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SLA Compliance</CardTitle>
              <CardDescription>Response and resolution time compliance rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Response SLA ({metrics?.avg_response_hours?.toFixed(1) || 0}h avg)</span>
                  <span className="font-medium">{responseSLARate}%</span>
                </div>
                <Progress value={responseSLARate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Resolution SLA ({metrics?.avg_resolution_hours?.toFixed(1) || 0}h avg)</span>
                  <span className="font-medium">{resolutionSLARate}%</span>
                </div>
                <Progress value={resolutionSLARate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Breach Alerts */}
          {(breaches?.length ?? 0) > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  SLA Breaches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {breaches?.slice(0, 5).map((breach) => (
                    <div key={breach.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                      <div>
                        <p className="font-medium text-sm">Request #{breach.request_id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {breach.breach_type} SLA breached by {Math.round(breach.breach_duration_minutes || 0)} minutes
                        </p>
                      </div>
                      <Badge variant="destructive">{breach.breach_type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-6 mt-6">
          {/* Urgent Requests Alert */}
          {urgentRequests.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Urgent: {urgentRequests.length} requests approaching SLA
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {/* Active Requests with SLA Timers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Requests</CardTitle>
              <CardDescription>{activeRequests.length} requests in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No active requests</p>
                ) : (
                  activeRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{request.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {request.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {request.request_number} • Created {format(new Date(request.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.sla_resolution_due && (
                          <SLATimer 
                            dueDate={request.sla_resolution_due} 
                            isResolved={request.status === 'completed'} 
                          />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csat" className="space-y-6 mt-6">
          {/* CSAT Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
              <CardDescription>Recent feedback from resolved requests</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Rating Distribution */}
              <div className="space-y-4 mb-6">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = feedback?.filter(f => f.rating === rating).length || 0;
                  const percentage = feedback?.length ? Math.round((count / feedback.length) * 100) : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recent Feedback */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recent Feedback</h4>
                {feedback?.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(item.submitted_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {item.feedback_text && (
                      <p className="text-sm text-muted-foreground">{item.feedback_text}</p>
                    )}
                  </div>
                ))}
                {(!feedback || feedback.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No feedback received yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
