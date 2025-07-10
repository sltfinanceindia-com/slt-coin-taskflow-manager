import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Target, Trophy } from 'lucide-react';
import { useUIUXExams } from '@/hooks/useUIUXExams';

export function UserExamResults() {
  const { userAttempts, isLoadingAttempts } = useUIUXExams();

  if (isLoadingAttempts) {
    return <div>Loading exam results...</div>;
  }

  if (userAttempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            UI/UX Exam Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No exam attempts yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          UI/UX Exam Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userAttempts.map((attempt, index) => {
          const percentage = attempt.total_questions > 0 
            ? Math.round((attempt.score / attempt.total_questions) * 100) 
            : 0;
          const isCompleted = !!attempt.completed_at;
          
          return (
            <div key={attempt.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Attempt #{userAttempts.length - index}
                </h4>
                <Badge variant={isCompleted ? 'default' : 'secondary'}>
                  {isCompleted ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              
              {isCompleted && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <span>Score: {attempt.score}/{attempt.total_questions} ({percentage}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time: {attempt.time_taken_minutes || 0} minutes</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Started: {new Date(attempt.started_at).toLocaleDateString()} at{' '}
                  {new Date(attempt.started_at).toLocaleTimeString()}
                </span>
              </div>
              
              {isCompleted && attempt.completed_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Completed: {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                    {new Date(attempt.completed_at).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}