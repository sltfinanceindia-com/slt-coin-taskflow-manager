/**
 * Time Logs Tab Component
 * Time tracking and logging
 */

import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { TimeLogDialog } from '@/components/TimeLogDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layouts/PageHeader';
import { Clock } from 'lucide-react';

export function TimeLogsTab() {
  const { profile } = useAuth();
  const { role, isAdmin } = useUserRole();
  const { timeLogs, logTime, isLogging } = useTimeLogs();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Time Logs"
        description="Track your working hours across tasks"
        actions={
          (role === 'intern' || role === 'employee') && (
            <TimeLogDialog onLogTime={logTime} isLogging={isLogging} />
          )
        }
      />
      
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>Your latest time logs and activity</CardDescription>
        </CardHeader>
        <CardContent>
          {timeLogs.length > 0 ? (
            <div className="space-y-4">
              {timeLogs
                .filter(log => isAdmin || log.user_id === profile?.id)
                .slice(0, 10)
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover-scale">
                    <div>
                      <h4 className="font-medium">{log.task?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {log.description || 'No description'}
                      </p>
                      {isAdmin && (
                        <p className="text-xs text-muted-foreground">
                          By: {log.user_profile?.full_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{log.hours_worked}h</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.date_logged).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No time logs yet</h3>
              <p className="text-muted-foreground">
                Start logging your work hours to track your progress.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
