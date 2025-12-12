import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkloadScenarios, WeeklyForecast } from '@/hooks/useWorkloadScenarios';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, RefreshCw, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WorkloadForecastProps {
  weeksToShow?: number;
}

export function WorkloadForecast({ weeksToShow = 12 }: WorkloadForecastProps) {
  const { workloadForecast, forecastLoading, refetchForecast } = useWorkloadScenarios();

  const getUtilizationColor = (pct: number) => {
    if (pct >= 100) return 'bg-destructive text-destructive-foreground';
    if (pct >= 85) return 'bg-amber-500 text-white';
    if (pct >= 60) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getUtilizationStatus = (pct: number) => {
    if (pct >= 100) return { label: 'Overloaded', icon: AlertTriangle, variant: 'destructive' as const };
    if (pct >= 85) return { label: 'High', icon: TrendingUp, variant: 'secondary' as const };
    if (pct >= 60) return { label: 'Optimal', icon: TrendingUp, variant: 'default' as const };
    return { label: 'Under', icon: TrendingDown, variant: 'outline' as const };
  };

  const forecast = workloadForecast.slice(0, weeksToShow);
  const overloadedWeeks = forecast.filter(w => w.utilization_pct >= 100).length;
  const avgUtilization = forecast.length > 0 
    ? Math.round(forecast.reduce((sum, w) => sum + w.utilization_pct, 0) / forecast.length)
    : 0;

  if (forecastLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workload Forecast
            </CardTitle>
            <CardDescription>
              {weeksToShow}-week capacity planning view
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Avg:</span>
                <Badge variant={avgUtilization >= 100 ? 'destructive' : 'secondary'}>
                  {avgUtilization}%
                </Badge>
              </div>
              {overloadedWeeks > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">{overloadedWeeks} overloaded</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchForecast()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {forecast.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No forecast data available</p>
            <p className="text-sm mt-1">Add tasks with due dates and estimates to see projections</p>
          </div>
        ) : (
          <>
            {/* Utilization bar chart */}
            <div className="mb-6 h-32 flex items-end gap-1">
              {forecast.map((week, idx) => {
                const height = Math.min(week.utilization_pct, 150);
                const status = getUtilizationStatus(week.utilization_pct);
                return (
                  <div
                    key={week.week_start}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`Week ${week.week_number}: ${week.utilization_pct}%`}
                  >
                    <span className="text-xs text-muted-foreground">{week.utilization_pct}%</span>
                    <div
                      className={`w-full rounded-t transition-all ${getUtilizationColor(week.utilization_pct)}`}
                      style={{ height: `${Math.max(height * 0.8, 4)}px` }}
                    />
                    <span className="text-xs text-muted-foreground">W{week.week_number}</span>
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-border mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span>100% capacity line</span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-destructive" /> Overloaded
                <span className="w-3 h-3 rounded bg-amber-500 ml-2" /> High
                <span className="w-3 h-3 rounded bg-primary ml-2" /> Optimal
              </span>
            </div>

            {/* Weekly cards grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {forecast.map((week) => {
                const status = getUtilizationStatus(week.utilization_pct);
                const StatusIcon = status.icon;
                return (
                  <Card key={week.week_start} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">
                          {format(parseISO(week.week_start), 'MMM d')}
                        </div>
                        <Badge variant={status.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Planned</span>
                          <span className="font-medium">{week.planned_hours}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">{week.capacity_hours}h</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getUtilizationColor(week.utilization_pct)}`}
                            style={{ width: `${Math.min(week.utilization_pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {week.assigned_resources} assigned
                          </span>
                          <span className={week.gap_hours < 0 ? 'text-destructive' : 'text-green-600'}>
                            {week.gap_hours > 0 ? '+' : ''}{week.gap_hours}h gap
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
