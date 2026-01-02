import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths, startOfYear } from 'date-fns';

export type ReportType = 'tasks' | 'performance' | 'attendance' | 'training' | 'coins' | 'expenses' | 'leaves';
export type DateRange = 'today' | 'last_7_days' | 'last_30_days' | 'last_quarter' | 'year_to_date' | 'custom';

interface ReportParams {
  reportType: ReportType;
  dateRange: DateRange;
  organizationId: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

export interface ReportData {
  columns: string[];
  rows: Record<string, any>[];
  summary: Record<string, number>;
}

function getDateRangeValues(dateRange: DateRange, customStart?: Date, customEnd?: Date) {
  const now = new Date();
  let startDate: Date;
  let endDate = now;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'last_7_days':
      startDate = subDays(now, 7);
      break;
    case 'last_30_days':
      startDate = subDays(now, 30);
      break;
    case 'last_quarter':
      startDate = subMonths(now, 3);
      break;
    case 'year_to_date':
      startDate = startOfYear(now);
      break;
    case 'custom':
      startDate = customStart || subDays(now, 30);
      endDate = customEnd || now;
      break;
    default:
      startDate = subDays(now, 30);
  }

  return { startDate, endDate };
}

export async function fetchReportData(params: ReportParams): Promise<ReportData> {
  const { reportType, dateRange, organizationId, customStartDate, customEndDate } = params;
  const { startDate, endDate } = getDateRangeValues(dateRange, customStartDate, customEndDate);

  switch (reportType) {
    case 'tasks':
      return fetchTasksReport(organizationId, startDate, endDate);
    case 'performance':
      return fetchPerformanceReport(organizationId, startDate, endDate);
    case 'attendance':
      return fetchAttendanceReport(organizationId, startDate, endDate);
    case 'training':
      return fetchTrainingReport(organizationId, startDate, endDate);
    case 'coins':
      return fetchCoinsReport(organizationId, startDate, endDate);
    case 'expenses':
      return fetchExpensesReport(organizationId, startDate, endDate);
    case 'leaves':
      return fetchLeavesReport(organizationId, startDate, endDate);
    default:
      return { columns: [], rows: [], summary: {} };
  }
}

async function fetchTasksReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, title, status, priority, created_at, updated_at,
      assignee:profiles!tasks_assigned_to_fkey(full_name),
      project:projects(name)
    `)
    .eq('organization_id', orgId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const rows = (tasks || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    assignee: task.assignee?.full_name || 'Unassigned',
    project: task.project?.name || 'No Project',
    status: task.status,
    priority: task.priority,
    created: format(new Date(task.created_at), 'MMM dd, yyyy')
  }));

  const summary = {
    total: rows.length,
    completed: rows.filter(r => r.status === 'verified' || r.status === 'completed').length,
    inProgress: rows.filter(r => r.status === 'in_progress' || r.status === 'assigned').length
  };

  return {
    columns: ['Title', 'Assignee', 'Project', 'Status', 'Priority', 'Created'],
    rows,
    summary
  };
}

async function fetchPerformanceReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, department, total_coins')
    .eq('organization_id', orgId)
    .eq('is_active', true);

  const rows = await Promise.all((profiles || []).map(async (profile) => {
    // Get task count
    const { count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', profile.id)
      .in('status', ['completed', 'verified'])
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    // Get attendance count
    const { count: attendanceCount } = await supabase
      .from('session_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('login_time', startDate.toISOString())
      .lte('login_time', endDate.toISOString());

    return {
      name: profile.full_name,
      email: profile.email,
      department: profile.department || 'N/A',
      tasksCompleted: taskCount || 0,
      daysPresent: attendanceCount || 0,
      totalCoins: profile.total_coins || 0
    };
  }));

  return {
    columns: ['Name', 'Email', 'Department', 'Tasks Completed', 'Days Present', 'Total Coins'],
    rows,
    summary: {
      totalEmployees: rows.length,
      totalTasks: rows.reduce((sum, r) => sum + r.tasksCompleted, 0),
      avgTasksPerEmployee: rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.tasksCompleted, 0) / rows.length) : 0
    }
  };
}

async function fetchAttendanceReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: sessions } = await supabase
    .from('session_logs')
    .select(`
      id, login_time, logout_time, session_duration_minutes,
      profile:profiles!session_logs_user_id_fkey(full_name, email)
    `)
    .eq('organization_id', orgId)
    .gte('login_time', startDate.toISOString())
    .lte('login_time', endDate.toISOString())
    .order('login_time', { ascending: false });

  const rows = (sessions || []).map(session => ({
    employee: (session.profile as any)?.full_name || 'Unknown',
    email: (session.profile as any)?.email || '',
    date: format(new Date(session.login_time), 'MMM dd, yyyy'),
    loginTime: format(new Date(session.login_time), 'HH:mm'),
    logoutTime: session.logout_time ? format(new Date(session.logout_time), 'HH:mm') : 'Active',
    hoursWorked: session.session_duration_minutes 
      ? `${Math.floor(session.session_duration_minutes / 60)}h ${session.session_duration_minutes % 60}m`
      : 'In Progress'
  }));

  const totalMinutes = (sessions || []).reduce((sum, s) => sum + (s.session_duration_minutes || 0), 0);

  return {
    columns: ['Employee', 'Email', 'Date', 'Login', 'Logout', 'Hours Worked'],
    rows,
    summary: {
      totalSessions: rows.length,
      totalHours: Math.round(totalMinutes / 60),
      avgHoursPerSession: rows.length > 0 ? Math.round(totalMinutes / rows.length / 60 * 10) / 10 : 0
    }
  };
}

async function fetchTrainingReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: progress } = await supabase
    .from('training_progress')
    .select(`
      *,
      user:profiles!training_progress_user_id_fkey(full_name)
    `)
    .eq('organization_id', orgId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const rows = (progress || []).map((p: any) => ({
    employee: p.user?.full_name || 'Unknown',
    progressType: p.progress_type,
    progressValue: p.progress_value,
    completedAt: p.completed_at ? format(new Date(p.completed_at), 'MMM dd, yyyy') : '-'
  }));

  return {
    columns: ['Employee', 'Type', 'Value', 'Completed'],
    rows,
    summary: {
      totalEnrollments: rows.length,
      completed: rows.filter(r => r.completedAt !== '-').length
    }
  };
}

async function fetchCoinsReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: transactions } = await supabase
    .from('coin_transactions')
    .select(`
      *,
      user:profiles!coin_transactions_user_id_fkey(full_name),
      task:tasks(title)
    `)
    .eq('organization_id', orgId)
    .gte('transaction_date', startDate.toISOString())
    .lte('transaction_date', endDate.toISOString())
    .order('transaction_date', { ascending: false });

  const rows = (transactions || []).map(t => ({
    employee: (t.user as any)?.full_name || 'Unknown',
    task: (t.task as any)?.title || 'Direct Award',
    coins: t.coins_earned,
    bonus: t.bonus_coins || 0,
    total: t.coins_earned + (t.bonus_coins || 0),
    status: t.status,
    date: format(new Date(t.transaction_date), 'MMM dd, yyyy')
  }));

  return {
    columns: ['Employee', 'Task', 'Coins', 'Bonus', 'Total', 'Status', 'Date'],
    rows,
    summary: {
      totalTransactions: rows.length,
      totalCoins: rows.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total, 0),
      pendingCoins: rows.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.total, 0)
    }
  };
}

async function fetchExpensesReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: expenses } = await supabase
    .from('expense_claims')
    .select(`
      *,
      employee:profiles!expense_claims_employee_id_fkey(full_name)
    `)
    .eq('organization_id', orgId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  const rows = (expenses || []).map(e => ({
    claimNumber: e.claim_number,
    employee: (e.employee as any)?.full_name || 'Unknown',
    title: e.title,
    category: e.category,
    amount: `₹${Number(e.amount).toLocaleString()}`,
    status: e.status,
    date: format(new Date(e.expense_date), 'MMM dd, yyyy')
  }));

  const totalAmount = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const approvedAmount = (expenses || []).filter(e => e.status === 'approved').reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    columns: ['Claim #', 'Employee', 'Title', 'Category', 'Amount', 'Status', 'Date'],
    rows,
    summary: {
      totalClaims: rows.length,
      totalAmount,
      approvedAmount,
      pendingAmount: totalAmount - approvedAmount
    }
  };
}

async function fetchLeavesReport(orgId: string, startDate: Date, endDate: Date): Promise<ReportData> {
  const { data: leaves } = await supabase
    .from('leave_requests')
    .select(`
      *,
      employee:profiles!leave_requests_user_id_fkey(full_name)
    `)
    .eq('organization_id', orgId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  const rows = (leaves || []).map((l: any) => ({
    employee: l.employee?.full_name || 'Unknown',
    startDate: format(new Date(l.start_date), 'MMM dd, yyyy'),
    endDate: format(new Date(l.end_date), 'MMM dd, yyyy'),
    days: l.total_days,
    status: l.status,
    reason: l.reason || '-'
  }));

  return {
    columns: ['Employee', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'],
    rows,
    summary: {
      totalRequests: rows.length,
      approved: rows.filter(r => r.status === 'approved').length,
      pending: rows.filter(r => r.status === 'pending').length,
      totalDays: rows.reduce((sum, r) => sum + (r.days || 0), 0)
    }
  };
}

// Export to CSV function
export function exportToCSV(data: ReportData, filename: string) {
  const headers = data.columns.join(',');
  const rows = data.rows.map(row => 
    data.columns.map(col => {
      const key = col.toLowerCase().replace(/\s+/g, '');
      const value = row[key] || row[col] || '';
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
