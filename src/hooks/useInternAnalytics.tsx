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

      // Get overall stats
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id, status, slt_coin_value')
        .eq('assigned_to', internId);

      const { data: allTimeLogs } = await supabase
        .from('time_logs')
        .select('hours_worked')
        .eq('user_id', internId);

      const { data: allComments } = await supabase
        .from('task_comments')
        .select('id')
        .eq('user_id', internId);

      const { data: allCoins } = await supabase
        .from('coin_transactions')
        .select('coins_earned, bonus_coins')
        .eq('user_id', internId)
        .eq('status', 'approved');

      return {
        weeklyData: weeks,
        totalStats: {
          totalTasks: allTasks?.length || 0,
          completedTasks: allTasks?.filter(t => t.status === 'verified').length || 0,
          totalHours: allTimeLogs?.reduce((sum, log) => sum + Number(log.hours_worked), 0) || 0,
          totalComments: allComments?.length || 0,
          totalCoins: allCoins?.reduce((sum, tx) => sum + tx.coins_earned + (tx.bonus_coins || 0), 0) || 0,
        }
      };
    },
    enabled: !!internId,
  });
}