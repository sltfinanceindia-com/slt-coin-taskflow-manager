/**
 * Timesheet related types
 * Centralized type definitions for timesheet functionality
 */

export type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export type HoursType = 'regular' | 'overtime' | 'training' | 'pto' | 'holiday' | 'sick';

export interface Timesheet {
  id: string;
  employee_id: string;
  organization_id?: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  overtime_hours: number;
  status: TimesheetStatus;
  submitted_at?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  employee?: {
    full_name: string;
    email: string;
  };
  entries?: TimesheetEntry[];
}

export interface TimesheetEntry {
  id: string;
  timesheet_id: string;
  organization_id?: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  description?: string | null;
  project_id?: string | null;
  task_id?: string | null;
  is_billable?: boolean;
  billing_rate?: number | null;
  hours_type?: HoursType;
  client_name?: string | null;
  cost_center?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  project?: {
    id: string;
    name: string;
  } | null;
  task?: {
    id: string;
    title: string;
    task_number?: string | null;
  } | null;
}

export interface TimesheetSummary {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  regularHours: number;
  overtimeHours: number;
  trainingHours: number;
  ptoHours: number;
  estimatedRevenue: number;
  targetHours: number;
}

export interface TimesheetFilters {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  employeeId?: string;
  projectId?: string;
  status?: TimesheetStatus;
}

// Create/Update DTOs
export interface CreateTimesheetDTO {
  employee_id: string;
  organization_id?: string;
  period_start: string;
  period_end: string;
  status?: TimesheetStatus;
}

export interface CreateTimesheetEntryDTO {
  timesheet_id: string;
  organization_id?: string;
  work_date: string;
  regular_hours: number;
  overtime_hours?: number;
  description?: string;
  project_id?: string;
  task_id?: string;
  is_billable?: boolean;
  billing_rate?: number;
  hours_type?: HoursType;
}

export interface UpdateTimesheetDTO {
  status?: TimesheetStatus;
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  total_hours?: number;
  overtime_hours?: number;
}

// Utility functions
export function getStatusColor(status: TimesheetStatus): string {
  const colors: Record<TimesheetStatus, string> = {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status] || colors.draft;
}

export function calculateTimesheetTotals(entries: TimesheetEntry[]): Pick<TimesheetSummary, 'totalHours' | 'regularHours' | 'overtimeHours'> {
  return entries.reduce(
    (acc, entry) => ({
      totalHours: acc.totalHours + (entry.regular_hours || 0) + (entry.overtime_hours || 0),
      regularHours: acc.regularHours + (entry.regular_hours || 0),
      overtimeHours: acc.overtimeHours + (entry.overtime_hours || 0),
    }),
    { totalHours: 0, regularHours: 0, overtimeHours: 0 }
  );
}
