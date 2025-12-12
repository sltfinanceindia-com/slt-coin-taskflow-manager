import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWorkloadScenarios } from '@/hooks/useWorkloadScenarios';
import { AlertTriangle, TrendingUp, Calendar, ChevronRight, Users, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface CapacityGapAlertProps {
  overloadThreshold?: number;
  weeksAhead?: number;
  onViewDetails?: () => void;
}

export function CapacityGapAlert({ 
  overloadThreshold = 100, 
  weeksAhead = 12,
  onViewDetails 
}: CapacityGapAlertProps) {
  const { workloadForecast, forecastLoading } = useWorkloadScenarios();

  const forecast = workloadForecast.slice(0, weeksAhead);
  
  // Find overloaded weeks
  const overloadedWeeks = forecast.filter(w => w.utilization_pct >= overloadThreshold);
  const criticalWeeks = forecast.filter(w => w.utilization_pct >= 120);
  
  // Find the most overloaded week
  const peakWeek = forecast.reduce((max, w) => 
    w.utilization_pct > (max?.utilization_pct || 0) ? w : max, 
    forecast[0]
  );

  // Calculate total gap hours
  const totalGapHours = overloadedWeeks.reduce((sum, w) => sum + Math.abs(w.gap_hours), 0);

  // Find first overloaded week
  const firstOverload = overloadedWeeks[0];

  if (forecastLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading capacity alerts...
        </CardContent>
      </Card>
    );
  }

  if (overloadedWeeks.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
            Capacity Looking Good
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600 dark:text-green-500">
            No overload periods detected in the next {weeksAhead} weeks. 
            Your team has sufficient capacity for planned work.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Capacity Alerts
            </CardTitle>
            <CardDescription className="text-amber-600/80 dark:text-amber-500/80">
              {overloadedWeeks.length} overload period{overloadedWeeks.length !== 1 ? 's' : ''} detected
            </CardDescription>
          </div>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            {totalGapHours}h over capacity
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {overloadedWeeks.length} weeks affected
          </Badge>
          {criticalWeeks.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalWeeks.length} critical
            </Badge>
          )}
        </div>

        {/* Critical alerts */}
        {criticalWeeks.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Critical Overload</AlertTitle>
            <AlertDescription>
              {criticalWeeks.length} week{criticalWeeks.length !== 1 ? 's' : ''} with 120%+ utilization. 
              Immediate action recommended.
            </AlertDescription>
          </Alert>
        )}

        {/* Overloaded weeks list */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Overloaded Periods:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {overloadedWeeks.slice(0, 4).map((week) => (
              <div 
                key={week.week_start} 
                className="flex items-center justify-between p-3 bg-background/80 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(parseISO(week.week_start), 'MMM d')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={week.utilization_pct >= 120 ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {week.utilization_pct}%
                  </Badge>
                  <span className="text-xs text-destructive font-medium">
                    {Math.abs(week.gap_hours)}h over
                  </span>
                </div>
              </div>
            ))}
          </div>
          {overloadedWeeks.length > 4 && (
            <p className="text-xs text-muted-foreground text-center">
              +{overloadedWeeks.length - 4} more overloaded weeks
            </p>
          )}
        </div>

        {/* Peak week highlight */}
        {peakWeek && peakWeek.utilization_pct >= overloadThreshold && (
          <div className="p-4 bg-background/80 rounded-lg border-2 border-destructive/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Peak Overload Week</span>
              <Badge variant="destructive">{peakWeek.utilization_pct}% utilization</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Week of</p>
                <p className="font-medium">{format(parseISO(peakWeek.week_start), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hours Over</p>
                <p className="font-medium text-destructive">{Math.abs(peakWeek.gap_hours)} hours</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-2">Recommended Actions:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Consider adding temporary resources or contractors
            </li>
            <li className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Evaluate if any deadlines can be shifted
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Review task priorities and consider deferring lower priority work
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
