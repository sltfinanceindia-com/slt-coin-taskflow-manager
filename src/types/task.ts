export interface Task {
  id: string;
  task_number?: string;
  title: string;
  description: string;
  assigned_to: string;
  created_by: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'verified' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slt_coin_value: number;
  start_date: string;
  end_date: string;
  submission_notes?: string;
  admin_feedback?: string;
  project_id?: string;
  project_owner_id?: string;
  created_at: string;
  updated_at: string;
  // Phase 2: Scheduling fields
  planned_start_date?: string | null;
  planned_end_date?: string | null;
  actual_start_date?: string | null;
  actual_end_date?: string | null;
  is_milestone?: boolean;
  is_critical?: boolean;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  progress_percentage?: number;
  assigned_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  creator_profile?: {
    id: string;
    full_name: string;
    email: string;
  };
  project_owner_profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateTaskData {
  title: string;
  description: string;
  assigned_to: string | string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slt_coin_value: number;
  start_date: string;
  end_date: string;
  project_id?: string;
  project_owner_id?: string;
}