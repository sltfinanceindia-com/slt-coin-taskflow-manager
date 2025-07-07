export interface Task {
  id: string;
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
  created_at: string;
  updated_at: string;
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
}

export interface CreateTaskData {
  title: string;
  description: string;
  assigned_to: string | string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slt_coin_value: number;
  start_date: string;
  end_date: string;
}