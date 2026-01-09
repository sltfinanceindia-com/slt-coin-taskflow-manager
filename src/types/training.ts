
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
// Profile type is now exported from employee.ts
// Use: import { Profile } from '@/types/employee'
