
-- 1. Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  head_id uuid REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add department_id to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- 2. Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'trophy',
  badge_color text DEFAULT '#FFD700',
  category text NOT NULL DEFAULT 'general',
  criteria jsonb DEFAULT '{}',
  points integer DEFAULT 0,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamptz DEFAULT now()
);

-- 3. User achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  organization_id uuid REFERENCES public.organizations(id),
  UNIQUE(user_id, achievement_id)
);

-- 4. Announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  priority text DEFAULT 'normal',
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  organization_id uuid REFERENCES public.organizations(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Announcement reads tracking
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  organization_id uuid REFERENCES public.organizations(id),
  PRIMARY KEY (user_id, announcement_id)
);

-- 6. Quick notes table
CREATE TABLE IF NOT EXISTS public.quick_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  color text DEFAULT '#FBBF24',
  reminder_at timestamptz,
  task_id uuid REFERENCES public.tasks(id),
  is_completed boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- Departments policies
CREATE POLICY "Users can view departments in their org" ON public.departments
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (is_any_admin(auth.uid()));

-- Achievements policies
CREATE POLICY "Users can view achievements" ON public.achievements
  FOR SELECT USING (organization_id = get_my_org_id() OR organization_id IS NULL);

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (is_any_admin(auth.uid()));

-- User achievements policies
CREATE POLICY "Users can view all user achievements in org" ON public.user_achievements
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage user achievements" ON public.user_achievements
  FOR ALL USING (is_any_admin(auth.uid()));

-- Announcements policies
CREATE POLICY "Users can view announcements in their org" ON public.announcements
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL USING (is_any_admin(auth.uid()));

-- Announcement reads policies
CREATE POLICY "Users can manage their own reads" ON public.announcement_reads
  FOR ALL USING (user_id = get_my_profile_id());

-- Quick notes policies
CREATE POLICY "Users can manage their own notes" ON public.quick_notes
  FOR ALL USING (user_id = get_my_profile_id());

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, badge_color, category, points, criteria) VALUES
  ('First Task', 'Complete your first task', 'check-circle', '#10B981', 'tasks', 10, '{"tasks_completed": 1}'),
  ('Task Master', 'Complete 50 tasks', 'trophy', '#FFD700', 'tasks', 100, '{"tasks_completed": 50}'),
  ('Centurion', 'Complete 100 tasks', 'crown', '#9333EA', 'tasks', 250, '{"tasks_completed": 100}'),
  ('Early Bird', 'Clock in before 9 AM for 5 consecutive days', 'sunrise', '#F59E0B', 'attendance', 50, '{"early_clockins": 5}'),
  ('Punctual Pro', 'Maintain 100% on-time attendance for a month', 'clock', '#3B82F6', 'attendance', 100, '{"perfect_attendance_days": 30}'),
  ('Training Rookie', 'Complete your first training module', 'book-open', '#6366F1', 'training', 20, '{"trainings_completed": 1}'),
  ('Knowledge Seeker', 'Complete 10 training modules', 'graduation-cap', '#8B5CF6', 'training', 150, '{"trainings_completed": 10}'),
  ('Coin Collector', 'Earn 100 coins', 'coins', '#EAB308', 'coins', 25, '{"coins_earned": 100}'),
  ('Wealthy Worker', 'Earn 1000 coins', 'gem', '#14B8A6', 'coins', 200, '{"coins_earned": 1000}'),
  ('Team Player', 'Send 100 messages in team channels', 'users', '#EC4899', 'communication', 30, '{"messages_sent": 100}'),
  ('Perfect Score', 'Score 100% on any assessment', 'award', '#F97316', 'assessment', 75, '{"perfect_assessment": 1}'),
  ('Streak Master', 'Maintain a 7-day login streak', 'flame', '#EF4444', 'engagement', 40, '{"login_streak": 7}')
ON CONFLICT DO NOTHING;

-- Create function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_org_id uuid, p_period text DEFAULT 'all')
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  total_coins bigint,
  tasks_completed bigint,
  rank bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      p.id as user_id,
      p.full_name,
      p.avatar_url,
      p.role::text,
      COALESCE(SUM(ct.coins_earned), 0)::bigint as total_coins,
      COUNT(DISTINCT CASE WHEN t.status = 'verified' THEN t.id END)::bigint as tasks_completed
    FROM public.profiles p
    LEFT JOIN public.coin_transactions ct ON ct.user_id = p.id 
      AND ct.status = 'approved'
      AND (p_period = 'all' OR 
           (p_period = 'week' AND ct.transaction_date >= CURRENT_DATE - INTERVAL '7 days') OR
           (p_period = 'month' AND ct.transaction_date >= CURRENT_DATE - INTERVAL '30 days'))
    LEFT JOIN public.tasks t ON t.assigned_to = p.id AND t.status = 'verified'
      AND (p_period = 'all' OR 
           (p_period = 'week' AND t.updated_at >= CURRENT_DATE - INTERVAL '7 days') OR
           (p_period = 'month' AND t.updated_at >= CURRENT_DATE - INTERVAL '30 days'))
    WHERE p.organization_id = p_org_id AND p.is_active = true
    GROUP BY p.id, p.full_name, p.avatar_url, p.role
  )
  SELECT 
    us.user_id,
    us.full_name,
    us.avatar_url,
    us.role,
    us.total_coins,
    us.tasks_completed,
    ROW_NUMBER() OVER (ORDER BY us.total_coins DESC, us.tasks_completed DESC)::bigint as rank
  FROM user_stats us
  ORDER BY rank;
END;
$$;
