import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OvertimeStats {
  regularHours: number;
  overtimeHours: number;
  expectedHours: number;
  overtimePercentage: number;
  dailyAverage: number;
}

interface OvertimeCalculatorProps {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function OvertimeCalculator({ userId, startDate, endDate }: OvertimeCalculatorProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<OvertimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<{
    work_start_time: string;
    work_end_time: string;
  } | null>(null);

  const targetUserId = userId || profile?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!targetUserId || !profile?.organization_id) return;

      // Fetch attendance settings
      const { data: settingsData } = await supabase
        .from('attendance_settings')
        .select('work_start_time, work_end_time')
        .eq('organization_id', profile.organization_id)
        .single();

      setSettings(settingsData || { work_start_time: '09:00', work_end_time: '18:00' });

      // Calculate standard work hours per day
      const workStart = settingsData?.work_start_time || '09:00';
      const workEnd = settingsData?.work_end_time || '18:00';
      const [startH, startM] = workStart.split(':').map(Number);
      const [endH, endM] = workEnd.split(':').map(Number);
      const standardHoursPerDay = (endH + endM / 60) - (startH + startM / 60);

      // Fetch session logs for the date range
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      const { data: sessions } = await supabase
        .from('session_logs')
        .select('login_time, logout_time, session_duration_minutes')
        .eq('user_id', targetUserId)
        .gte('login_time', start.toISOString())
        .lte('login_time', end.toISOString());

      if (!sessions || sessions.length === 0) {
        setStats({
          regularHours: 0,
          overtimeHours: 0,
          expectedHours: 0,
          overtimePercentage: 0,
          dailyAverage: 0
        });
        setLoading(false);
        return;
      }

      // Group by date and calculate hours
      const dayGroups = new Map<string, number>();
      sessions.forEach(session => {
        const date = new Date(session.login_time).toDateString();
        const minutes = session.session_duration_minutes || 0;
        dayGroups.set(date, (dayGroups.get(date) || 0) + minutes);
      });

      let totalRegularMinutes = 0;
      let totalOvertimeMinutes = 0;
      const standardMinutesPerDay = standardHoursPerDay * 60;

      dayGroups.forEach(totalMinutes => {
        if (totalMinutes <= standardMinutesPerDay) {
          totalRegularMinutes += totalMinutes;
        } else {
          totalRegularMinutes += standardMinutesPerDay;
          totalOvertimeMinutes += totalMinutes - standardMinutesPerDay;
        }
      });

      const workingDays = dayGroups.size;
      const expectedHours = workingDays * standardHoursPerDay;
      const regularHours = totalRegularMinutes / 60;
      const overtimeHours = totalOvertimeMinutes / 60;

      setStats({
        regularHours: Math.round(regularHours * 10) / 10,
        overtimeHours: Math.round(overtimeHours * 10) / 10,
        expectedHours: Math.round(expectedHours * 10) / 10,
        overtimePercentage: expectedHours > 0 ? Math.round((overtimeHours / expectedHours) * 100) : 0,
        dailyAverage: workingDays > 0 ? Math.round(((regularHours + overtimeHours) / workingDays) * 10) / 10 : 0
      });
      setLoading(false);
    };

    fetchData();
  }, [targetUserId, profile?.organization_id, startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalHours = stats.regularHours + stats.overtimeHours;
  const utilizationPercentage = stats.expectedHours > 0 
    ? Math.min(100, (totalHours / stats.expectedHours) * 100) 
    : 0;

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Overtime Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Regular Hours</p>
            <p className="text-2xl font-bold">{stats.regularHours}h</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Overtime Hours</p>
            <p className="text-2xl font-bold text-amber-600">{stats.overtimeHours}h</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time Utilization</span>
            <span className="font-medium">{Math.round(utilizationPercentage)}%</span>
          </div>
          <Progress value={utilizationPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <p className="text-muted-foreground">Daily Average</p>
            <p className="font-medium">{stats.dailyAverage}h / day</p>
          </div>
          {stats.overtimePercentage > 20 && (
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-600">
              <AlertTriangle className="h-3 w-3" />
              High OT ({stats.overtimePercentage}%)
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to calculate overtime for payroll
export async function calculateOvertimeForPayroll(
  userId: string,
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<{ regularHours: number; overtimeHours: number; overtimeRate: number }> {
  // Fetch settings
  const { data: settings } = await supabase
    .from('attendance_settings')
    .select('work_start_time, work_end_time')
    .eq('organization_id', organizationId)
    .single();

  const workStart = settings?.work_start_time || '09:00';
  const workEnd = settings?.work_end_time || '18:00';
  const [startH, startM] = workStart.split(':').map(Number);
  const [endH, endM] = workEnd.split(':').map(Number);
  const standardHoursPerDay = (endH + endM / 60) - (startH + startM / 60);

  // Fetch sessions
  const { data: sessions } = await supabase
    .from('session_logs')
    .select('login_time, logout_time, session_duration_minutes')
    .eq('user_id', userId)
    .gte('login_time', startDate.toISOString())
    .lte('login_time', endDate.toISOString());

  if (!sessions || sessions.length === 0) {
    return { regularHours: 0, overtimeHours: 0, overtimeRate: 1.5 };
  }

  const dayGroups = new Map<string, number>();
  sessions.forEach(session => {
    const date = new Date(session.login_time).toDateString();
    const minutes = session.session_duration_minutes || 0;
    dayGroups.set(date, (dayGroups.get(date) || 0) + minutes);
  });

  let totalRegularMinutes = 0;
  let totalOvertimeMinutes = 0;
  const standardMinutesPerDay = standardHoursPerDay * 60;

  dayGroups.forEach(totalMinutes => {
    if (totalMinutes <= standardMinutesPerDay) {
      totalRegularMinutes += totalMinutes;
    } else {
      totalRegularMinutes += standardMinutesPerDay;
      totalOvertimeMinutes += totalMinutes - standardMinutesPerDay;
    }
  });

  return {
    regularHours: totalRegularMinutes / 60,
    overtimeHours: totalOvertimeMinutes / 60,
    overtimeRate: 1.5 // Standard overtime rate
  };
}
