export interface TrainingSection {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  videos?: TrainingVideo[];
  assignments?: TrainingAssignment[];
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