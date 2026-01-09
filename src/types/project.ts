/**
 * Project related types
 * Centralized type definitions for project management
 */

export type ProjectStatus = 
  | 'planning' 
  | 'active' 
  | 'on_hold' 
  | 'completed' 
  | 'cancelled' 
  | 'archived';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id?: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  budget?: number;
  spent_budget?: number;
  progress_percentage?: number;
  owner_id?: string;
  manager_id?: string;
  program_id?: string;
  portfolio_id?: string;
  created_at?: string;
  updated_at?: string;
  // Joined relations
  owner?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  manager?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  program?: {
    id: string;
    name: string;
  };
  portfolio?: {
    id: string;
    name: string;
  };
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: ProjectStatus;
  progress_percentage?: number;
}

export interface ProjectWithTasks extends Project {
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  task_count?: number;
  completed_task_count?: number;
}

// Portfolio Management
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  organization_id?: string;
  owner_id?: string;
  status?: string;
  strategic_alignment?: string;
  total_budget?: number;
  created_at?: string;
  updated_at?: string;
  programs?: Program[];
  projects?: Project[];
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  organization_id?: string;
  portfolio_id?: string;
  owner_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at?: string;
  updated_at?: string;
  projects?: Project[];
}

// Project Updates
export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  update_type?: 'status' | 'progress' | 'issue' | 'milestone' | 'general';
  created_at?: string;
  updated_at?: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// Baseline Management
export interface ProjectBaseline {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  baseline_date: string;
  planned_start_date?: string;
  planned_end_date?: string;
  planned_budget?: number;
  planned_scope?: string;
  created_by?: string;
  created_at?: string;
}

// Change Requests
export interface ChangeRequest {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  reason?: string;
  impact_analysis?: Record<string, unknown>;
  priority: ProjectPriority;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  budget_impact?: number;
  schedule_impact_days?: number;
  created_at?: string;
  updated_at?: string;
}

// Create/Update DTOs
export interface CreateProjectDTO {
  name: string;
  description?: string;
  organization_id?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  start_date?: string;
  end_date?: string;
  budget?: number;
  owner_id?: string;
  manager_id?: string;
  program_id?: string;
  portfolio_id?: string;
}

export interface UpdateProjectDTO extends Partial<CreateProjectDTO> {
  progress_percentage?: number;
  spent_budget?: number;
  actual_completion_date?: string;
}

// Utility functions
export function getProjectStatusColor(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || colors.planning;
}

export function getProjectPriorityColor(priority: ProjectPriority): string {
  const colors: Record<ProjectPriority, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[priority] || colors.medium;
}
