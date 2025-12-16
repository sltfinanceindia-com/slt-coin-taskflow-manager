
export interface TrainingSection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  training_videos?: TrainingVideo[];
  training_assignments?: TrainingAssignment[];
}

export interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  is_published: boolean;
}

export interface TrainingAssignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  due_days: number;
  max_points: number;
  is_published: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'employee' | 'intern';
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  bio?: string;
  total_coins?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}
