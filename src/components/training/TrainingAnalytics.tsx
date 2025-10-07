import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAssessmentAttempts } from '@/hooks/useAssessmentAttempts';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Users, Award, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function TrainingAnalytics() {
  const { attempts, isLoading } = useAssessmentAttempts();
  const { profile } = useAuth();

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>;
  }

  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === 'submitted').length;
  const passedAttempts = attempts.filter(a => a.is_passed).length;
  const averageScore = attempts.filter(a => a.score).reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.filter(a => a.score).length || 0;
  const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;
  const passRate = completedAttempts > 0 ? (passedAttempts / completedAttempts) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedAttempts} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
            <Progress value={averageScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(passRate)}%</div>
            <Progress value={passRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Analysis of training performance and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {passRate >= 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">Excellent Performance</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Pass rate is above 80%. Great job maintaining high standards!
                  </p>
                </div>
              </div>
            )}

            {passRate < 60 && completedAttempts > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Improvement Needed</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Pass rate is below 60%. Consider reviewing training materials.
                  </p>
                </div>
              </div>
            )}

            {completionRate < 50 && totalAttempts > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Low Completion Rate</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Less than half of started assessments are completed. Consider follow-ups.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
