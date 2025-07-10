
export interface UIUXExam {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  questions?: ExamQuestion[];
}

export interface UIUXExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  is_passed: boolean | null;
  completed_at: string | null;
  started_at: string;
  time_taken_minutes: number | null;
}

export interface ExamQuestion {
  id: string;
  question_number: number;
  question_text: string;
  options: ExamOption[];
}

export interface ExamOption {
  id: string;
  option_number: number;
  option_text: string;
  is_correct: boolean;
}

export interface ExamAttempt {
  id: string;
  score: number;
  total_questions: number;
  is_passed: boolean;
  completed_at: string | null;
  time_taken_minutes: number | null;
}
