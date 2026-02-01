/**
 * Employee History Tab
 * Timeline view of all events - promotions, transfers, salary revisions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowUp, ArrowRight, DollarSign, FileText, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface EmployeeHistoryTabProps {
  employeeId: string;
}

export function EmployeeHistoryTab({ employeeId }: EmployeeHistoryTabProps) {
  // Fetch activity logs for this employee
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['employee-history', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', employeeId)
        .order('timestamp', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <ArrowUp className="h-4 w-4" />;
      case 'transfer': return <ArrowRight className="h-4 w-4" />;
      case 'salary_revision': return <DollarSign className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'promotion': return 'bg-green-500';
      case 'transfer': return 'bg-blue-500';
      case 'salary_revision': return 'bg-purple-500';
      case 'document': return 'bg-amber-500';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Employment Timeline
          </CardTitle>
          <CardDescription>Complete history of changes and events</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No history records found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              {/* Timeline events */}
              <div className="space-y-6">
                {activityLogs.map((log: any) => (
                  <div key={log.id} className="relative flex gap-4 pl-10">
                    {/* Timeline dot */}
                    <div className={`absolute left-2 p-1.5 rounded-full text-white ${getEventColor(log.activity_type)}`}>
                      {getEventIcon(log.activity_type)}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">
                          {log.activity_type?.replace('_', ' ') || 'Activity'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(log.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      {log.metadata && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {typeof log.metadata === 'string' 
                            ? log.metadata 
                            : JSON.stringify(log.metadata)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
