import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, TrendingUp, CheckCircle, BookOpen, Coffee } from 'lucide-react';

interface TimesheetSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  regularHours: number;
  overtimeHours: number;
  trainingHours: number;
  ptoHours: number;
  estimatedRevenue: number;
  targetHours?: number;
}

interface TimesheetSummaryCardsProps {
  summary: TimesheetSummary;
}

export function TimesheetSummaryCards({ summary }: TimesheetSummaryCardsProps) {
  const targetHours = summary.targetHours || 40;
  const utilizationRate = targetHours > 0 
    ? Math.round((summary.totalHours / targetHours) * 100) 
    : 0;
  const billableRate = summary.totalHours > 0 
    ? Math.round((summary.billableHours / summary.totalHours) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Total Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalHours.toFixed(1)}h</div>
          <Progress value={utilizationRate} className="mt-2 h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">{utilizationRate}% of target</p>
        </CardContent>
      </Card>

      {/* Billable Hours */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-green-600">Billable</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{summary.billableHours.toFixed(1)}h</div>
          <div className="flex items-center gap-1 mt-1">
            <Progress value={billableRate} className="flex-1 h-1.5 bg-green-100 [&>div]:bg-green-500" />
            <span className="text-xs text-green-600">{billableRate}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Non-Billable Hours */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-orange-600">Non-Billable</CardTitle>
          <Coffee className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{summary.nonBillableHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.trainingHours > 0 && `${summary.trainingHours.toFixed(1)}h training`}
          </p>
        </CardContent>
      </Card>

      {/* Overtime */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Overtime</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{summary.overtimeHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground mt-1">extra hours logged</p>
        </CardContent>
      </Card>

      {/* Training Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Training</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{summary.trainingHours.toFixed(1)}h</div>
          <p className="text-xs text-muted-foreground mt-1">LMS & development</p>
        </CardContent>
      </Card>

      {/* Estimated Revenue */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium text-green-700 dark:text-green-400">Est. Revenue</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            ${summary.estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-green-600 dark:text-green-500 mt-1">from billable hours</p>
        </CardContent>
      </Card>
    </div>
  );
}
