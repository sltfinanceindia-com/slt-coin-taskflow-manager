import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Target, Trophy, User } from 'lucide-react';
import { useUIUXExamsAdmin } from '@/hooks/useUIUXExams';

export function AdminExamResults() {
  const { allAttempts, isLoadingAttempts } = useUIUXExamsAdmin();

  if (isLoadingAttempts) {
    return <div>Loading exam results...</div>;
  }

  if (allAttempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            All UI/UX Exam Results
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
          All UI/UX Exam Results ({allAttempts.length} attempts)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {allAttempts.map((attempt) => {
            const percentage = attempt.total_questions > 0 
              ? Math.round((attempt.score / attempt.total_questions) * 100) 
              : 0;
            const isCompleted = !!attempt.completed_at;
            const profile = attempt.profiles;
            
            return (
              <div key={attempt.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{profile?.full_name || 'Unknown User'}</span>
                    <span className="text-sm text-muted-foreground">({profile?.email})</span>
                  </div>
                  <Badge variant={isCompleted ? 'default' : 'secondary'}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                
                {isCompleted && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Score: {attempt.score}/{attempt.total_questions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Percentage: {percentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time: {attempt.time_taken_minutes || 0} min</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Started: {new Date(attempt.started_at).toLocaleDateString()} at{' '}
                      {new Date(attempt.started_at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {isCompleted && attempt.completed_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Completed: {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                        {new Date(attempt.completed_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {!isCompleted && (
                  <div className="text-sm text-amber-600">
                    ⚠️ Exam in progress - started {Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / (1000 * 60))} minutes ago
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}