import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';

export interface WeeklyData {
  week: string;
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  totalHours: number;
  commentsAdded: number;
  coinsEarned: number;
}

export interface ComprehensiveStats {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  totalComments: number;
  totalCoins: number;
  totalSessions: number;
  totalSessionHours: number;
  averageSessionDuration: number;
  trainingProgress: number;
  assessmentsPassed: number;
  assessmentsFailed: number;
  emailsSent: number;
  adminNotes: number;
  activityLogs: number;
  lastLoginDate: string | null;
  accountCreatedDate: string;
}

export function useInternAnalytics(internId: string) {
  return useQuery({
    queryKey: ['intern-analytics', internId],
    queryFn: async () => {
      const now = new Date();
      const weeks: WeeklyData[] = [];
      
      // Get data for last 12 weeks
      for (let i = 0; i < 12; i++) {
        const weekDate = subWeeks(now, i);
        const weekStart = startOfWeek(weekDate);
        const weekEnd = endOfWeek(weekDate);
        
        // Get completed tasks for this week
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status, slt_coin_value, updated_at')
          .eq('assigned_to', internId)
          .eq('status', 'verified')
          .gte('updated_at', weekStart.toISOString())
          .lte('updated_at', weekEnd.toISOString());

        // Get time logs for this week
        const { data: timeLogs } = await supabase
          .from('time_logs')
          .select('hours_worked')
          .eq('user_id', internId)
          .gte('date_logged', format(weekStart, 'yyyy-MM-dd'))
          .lte('date_logged', format(weekEnd, 'yyyy-MM-dd'));

        // Get comments for this week
        const { data: comments } = await supabase
          .from('task_comments')
          .select('id')
          .eq('user_id', internId)
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString());

        // Get coin transactions for this week
        const { data: coinTransactions } = await supabase
          .from('coin_transactions')
          .select('coins_earned, bonus_coins')
          .eq('user_id', internId)
          .eq('status', 'approved')
          .gte('transaction_date', weekStart.toISOString())
          .lte('transaction_date', weekEnd.toISOString());

        const weekData: WeeklyData = {
          week: format(weekStart, 'MMM dd'),
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd'),
          tasksCompleted: tasks?.length || 0,
          totalHours: timeLogs?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0,
          commentsAdded: comments?.length || 0,
          coinsEarned: coinTransactions?.reduce((sum, tx) => sum + tx.coins_earned + (tx.bonus_coins || 0), 0) || 0,
        };

        weeks.unshift(weekData);
      }

      // Get comprehensive stats
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id, status, slt_coin_value, created_at')
        .eq('assigned_to', internId);

      const { data: allTimeLogs } = await supabase
        .from('time_logs')
        .select('hours_worked')
        .eq('user_id', internId);

      const { data: allComments } = await supabase
        .from('task_comments')
        .select('id, created_at')
        .eq('user_id', internId);

      const { data: allCoins } = await supabase
        .from('coin_transactions')
        .select('coins_earned, bonus_coins')
        .eq('user_id', internId)
        .eq('status', 'approved');

      // Get session data
      const { data: sessionLogs } = await supabase
        .from('session_logs')
        .select('session_duration_minutes, login_time, logout_time')
        .eq('user_id', internId);

      // Get training progress
      const { data: trainingProgress } = await supabase
        .from('training_progress')
        .select('progress_value, progress_type')
        .eq('user_id', internId);

      // Get assessment attempts
      const { data: assessmentAttempts } = await supabase
        .from('assessment_attempts')
        .select('is_passed, status')
        .eq('user_id', internId)
        .eq('status', 'completed');

      // Get email notifications
      const { data: emailNotifications } = await supabase
        .from('email_notifications')
        .select('id')
        .eq('user_id', internId);

      // Get admin notes
      const { data: adminNotes } = await supabase
        .from('admin_notes')
        .select('id')
        .eq('intern_id', internId);

      // Get activity logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('id, timestamp')
        .eq('user_id', internId);

      // Get profile creation date
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', internId)
        .single();

      // Calculate stats
      const totalSessionMinutes = sessionLogs?.reduce((sum, session) => sum + (session.session_duration_minutes || 0), 0) || 0;
      const completedSessions = sessionLogs?.filter(session => session.logout_time)?.length || 0;
      const averageSessionDuration = completedSessions > 0 ? totalSessionMinutes / completedSessions : 0;
      
      const trainingProgressValue = trainingProgress?.reduce((sum, progress) => sum + (progress.progress_value || 0), 0) || 0;
      const trainingCount = trainingProgress?.length || 0;
      const avgTrainingProgress = trainingCount > 0 ? trainingProgressValue / trainingCount : 0;

      const lastLogin = sessionLogs?.length > 0 
        ? sessionLogs.sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())[0].login_time
        : null;

      const totalStats: ComprehensiveStats = {
        totalTasks: allTasks?.length || 0,
        completedTasks: allTasks?.filter(t => t.status === 'verified').length || 0,
        totalHours: allTimeLogs?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0,
        totalComments: allComments?.length || 0,
        totalCoins: allCoins?.reduce((sum, tx) => sum + tx.coins_earned + (tx.bonus_coins || 0), 0) || 0,
        totalSessions: sessionLogs?.length || 0,
        totalSessionHours: totalSessionMinutes / 60,
        averageSessionDuration: Math.round(averageSessionDuration),
        trainingProgress: Math.round(avgTrainingProgress),
        assessmentsPassed: assessmentAttempts?.filter(attempt => attempt.is_passed)?.length || 0,
        assessmentsFailed: assessmentAttempts?.filter(attempt => !attempt.is_passed)?.length || 0,
        emailsSent: emailNotifications?.length || 0,
        adminNotes: adminNotes?.length || 0,
        activityLogs: activityLogs?.length || 0,
        lastLoginDate: lastLogin,
        accountCreatedDate: profile?.created_at || '',
      };

      return {
        weeklyData: weeks,
        totalStats,
        detailedData: {
          allTasks: allTasks || [],
          sessionLogs: sessionLogs || [],
          trainingProgress: trainingProgress || [],
          assessmentAttempts: assessmentAttempts || [],
          emailNotifications: emailNotifications || [],
          adminNotes: adminNotes || [],
          activityLogs: activityLogs || [],
        }
      };
    },
    enabled: !!internId,
  });
}