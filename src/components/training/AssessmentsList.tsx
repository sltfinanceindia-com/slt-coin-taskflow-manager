import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function AssessmentsList() {
  const { profile } = useAuth();

  const { data: attempts, isLoading, error: queryError } = useQuery({
    queryKey: ['assessment-attempts', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('*, assessments(title, passing_score)')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Assessment Results
        </CardTitle>
        <CardDescription>View your assessment attempts and scores</CardDescription>
      </CardHeader>
      <CardContent>
        {queryError ? (
          <div className="text-center py-12" data-testid="error-assessments">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
            <p className="font-medium">Failed to load assessments</p>
            <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : attempts && attempts.length > 0 ? (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{(attempt.assessments as any)?.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(attempt.created_at), 'PPP')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{attempt.score}%</span>
                  {attempt.is_passed ? (
                    <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>
                  ) : (
                    <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No assessment attempts yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
