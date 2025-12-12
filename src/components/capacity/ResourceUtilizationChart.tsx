import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkloadScenarios } from '@/hooks/useWorkloadScenarios';
import { Activity, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ResourceUtilizationChartProps {
  weeksToShow?: number;
  showDetails?: boolean;
}

export function ResourceUtilizationChart({ weeksToShow = 8, showDetails = true }: ResourceUtilizationChartProps) {
  const { workloadForecast, forecastLoading } = useWorkloadScenarios();

  const forecast = workloadForecast.slice(0, weeksToShow);
  
  // Calculate metrics
  const maxUtilization = forecast.length > 0 ? Math.max(...forecast.map(w => w.utilization_pct)) : 0;
  const minUtilization = forecast.length > 0 ? Math.min(...forecast.map(w => w.utilization_pct)) : 0;
  const avgUtilization = forecast.length > 0 
    ? Math.round(forecast.reduce((sum, w) => sum + w.utilization_pct, 0) / forecast.length)
    : 0;
  const totalPlannedHours = forecast.reduce((sum, w) => sum + w.planned_hours, 0);
  const totalCapacityHours = forecast.reduce((sum, w) => sum + w.capacity_hours, 0);

  const getBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-destructive';
    if (pct >= 85) return 'bg-amber-500';
    if (pct >= 60) return 'bg-primary';
    return 'bg-muted-foreground/50';
  };

  if (forecastLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Resource Utilization
            </CardTitle>
            <CardDescription>
              Forecasted utilization over {weeksToShow} weeks
            </CardDescription>
          </div>
          {showDetails && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {totalCapacityHours}h capacity
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary stats */}
        {showDetails && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Min</span>
              </div>
              <p className="text-2xl font-bold">{minUtilization}%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Avg</span>
              </div>
              <p className="text-2xl font-bold">{avgUtilization}%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Max</span>
              </div>
              <p className="text-2xl font-bold">{maxUtilization}%</p>
            </div>
          </div>
        )}

        {/* Chart area */}
        <div className="relative">
          {/* 100% line indicator */}
          <div className="absolute inset-x-0 bottom-[100px] border-t-2 border-dashed border-destructive/30 z-10">
            <span className="absolute -top-3 right-0 text-xs text-destructive">100%</span>
          </div>

          {/* Bar chart */}
          <div className="h-40 flex items-end gap-2 pt-4">
            {forecast.map((week) => {
              // Scale: 150% max for overflow visualization
              const heightPct = Math.min((week.utilization_pct / 150) * 100, 100);
              return (
                <div
                  key={week.week_start}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  {/* Utilization percentage */}
                  <span className={`text-xs font-medium transition-opacity ${
                    week.utilization_pct >= 100 ? 'text-destructive' : 'text-muted-foreground opacity-0 group-hover:opacity-100'
                  }`}>
                    {week.utilization_pct}%
                  </span>
                  
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${getBarColor(week.utilization_pct)} group-hover:opacity-80`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    title={`${format(parseISO(week.week_start), 'MMM d')}: ${week.utilization_pct}%`}
                  />
                  
                  {/* Week label */}
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {format(parseISO(week.week_start), 'M/d')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-muted-foreground/50" />
            Under 60%
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary" />
            Optimal (60-85%)
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500" />
            High (85-100%)
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-destructive" />
            Overloaded (100%+)
          </div>
        </div>

        {forecast.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No utilization data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
