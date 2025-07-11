
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAssessmentAttempts } from '@/hooks/useAssessmentAttempts';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export function UserAssessmentResults() {
  const { attempts, isLoading } = useAssessmentAttempts();

  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (attempts.length === 0) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Assessment Results</span>
          </CardTitle>
          <CardDescription>Your assessment history and scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assessments completed yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const passedCount = attempts.filter(a => a.is_passed).length;
  const averageScore = Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length);

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Assessment Results</span>
        </CardTitle>
        <CardDescription>Your assessment history and scores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Total Passed</div>
                <div className="text-2xl font-bold text-green-600">{passedCount}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Total Attempts</div>
                <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-background/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium">Average Score</div>
                <div className="text-2xl font-bold text-purple-600">{averageScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="space-y-4">
          <h4 className="font-medium">Recent Attempts</h4>
          <div className="space-y-3">
            {attempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="border rounded-lg p-4 hover-scale">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="font-medium">{attempt.assessments.title}</h5>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(attempt.submitted_at!).toLocaleDateString()}
                      </span>
                      <span>
                        {attempt.correct_answers}/{attempt.total_questions} correct
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      {attempt.score}%
                    </div>
                    <Badge variant={attempt.is_passed ? "default" : "destructive"}>
                      {attempt.is_passed ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Passed</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={attempt.score || 0} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
