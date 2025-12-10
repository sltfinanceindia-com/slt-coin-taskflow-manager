-- Feature 5: 360-Degree Feedback System
CREATE TABLE public.feedback_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  is_anonymous BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  cycle_id UUID REFERENCES public.feedback_cycles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.profiles(id) NOT NULL, -- person being reviewed
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL, -- person giving feedback
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('self', 'manager', 'peer', 'subordinate')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  request_id UUID REFERENCES public.feedback_requests(id) ON DELETE CASCADE NOT NULL,
  question_category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature 6: Goal Setting & OKR Tracking
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  parent_id UUID REFERENCES public.objectives(id), -- for cascading objectives
  level TEXT NOT NULL DEFAULT 'individual' CHECK (level IN ('company', 'team', 'individual')),
  quarter TEXT, -- e.g., 'Q1 2024'
  year INTEGER,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'behind', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  objective_id UUID REFERENCES public.objectives(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT, -- e.g., '%', 'count', '$'
  start_value NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'behind', 'completed')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.okr_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  key_result_id UUID REFERENCES public.key_results(id) ON DELETE CASCADE NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature 7: One-on-One Meeting Manager
CREATE TABLE public.one_on_one_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., 'weekly', 'biweekly', 'monthly'
  location TEXT,
  meeting_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  topic_type TEXT DEFAULT 'general' CHECK (topic_type IN ('achievement', 'challenge', 'goal', 'feedback', 'general')),
  is_discussed BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false, -- visible only to note creator
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.meeting_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  meeting_id UUID REFERENCES public.one_on_one_meetings(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature 8: Performance Improvement Plans (PIP)
CREATE TABLE public.performance_improvement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  employee_id UUID REFERENCES public.profiles(id) NOT NULL,
  manager_id UUID REFERENCES public.profiles(id) NOT NULL,
  hr_representative_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'extended', 'completed_success', 'completed_failure', 'cancelled')),
  final_outcome TEXT,
  final_outcome_date DATE,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pip_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  pip_id UUID REFERENCES public.performance_improvement_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  success_criteria TEXT NOT NULL,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'achieved', 'not_achieved')),
  progress_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pip_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  pip_id UUID REFERENCES public.performance_improvement_plans(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  manager_notes TEXT,
  employee_notes TEXT,
  overall_progress TEXT CHECK (overall_progress IN ('improving', 'stable', 'declining', 'meeting_expectations')),
  next_steps TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.feedback_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okr_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pip_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pip_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback_cycles
CREATE POLICY "Admins can manage feedback cycles" ON public.feedback_cycles
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view active feedback cycles" ON public.feedback_cycles
  FOR SELECT USING (status = 'active' OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for feedback_requests
CREATE POLICY "Admins can manage feedback requests" ON public.feedback_requests
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view their own feedback requests" ON public.feedback_requests
  FOR SELECT USING (
    reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    subject_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Reviewers can update their feedback requests" ON public.feedback_requests
  FOR UPDATE USING (reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for feedback_responses
CREATE POLICY "Admins can view all feedback responses" ON public.feedback_responses
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Reviewers can manage their responses" ON public.feedback_responses
  FOR ALL USING (
    request_id IN (SELECT id FROM feedback_requests WHERE reviewer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- RLS Policies for objectives
CREATE POLICY "Admins can manage all objectives" ON public.objectives
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view objectives" ON public.objectives
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can manage their objectives" ON public.objectives
  FOR ALL USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for key_results
CREATE POLICY "Admins can manage all key results" ON public.key_results
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view key results" ON public.key_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Objective owners can manage key results" ON public.key_results
  FOR ALL USING (
    objective_id IN (SELECT id FROM objectives WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- RLS Policies for okr_check_ins
CREATE POLICY "Admins can manage all check-ins" ON public.okr_check_ins
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can view check-ins" ON public.okr_check_ins
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create check-ins for their key results" ON public.okr_check_ins
  FOR INSERT WITH CHECK (
    key_result_id IN (
      SELECT kr.id FROM key_results kr
      JOIN objectives o ON kr.objective_id = o.id
      WHERE o.owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for one_on_one_meetings
CREATE POLICY "Admins can manage all meetings" ON public.one_on_one_meetings
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Participants can view their meetings" ON public.one_on_one_meetings
  FOR SELECT USING (
    manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can manage their meetings" ON public.one_on_one_meetings
  FOR ALL USING (manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for meeting_agenda_items
CREATE POLICY "Meeting participants can manage agenda" ON public.meeting_agenda_items
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM one_on_one_meetings 
      WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
      OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for meeting_notes
CREATE POLICY "Participants can manage meeting notes" ON public.meeting_notes
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM one_on_one_meetings 
      WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
      OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for meeting_action_items
CREATE POLICY "Participants can manage action items" ON public.meeting_action_items
  FOR ALL USING (
    meeting_id IN (
      SELECT id FROM one_on_one_meetings 
      WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
      OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    ) OR assigned_to IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for performance_improvement_plans
CREATE POLICY "Admins can manage all PIPs" ON public.performance_improvement_plans
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Managers can manage their PIPs" ON public.performance_improvement_plans
  FOR ALL USING (manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Employees can view their own PIPs" ON public.performance_improvement_plans
  FOR SELECT USING (employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for pip_goals
CREATE POLICY "Admins can manage all PIP goals" ON public.pip_goals
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "PIP participants can view goals" ON public.pip_goals
  FOR SELECT USING (
    pip_id IN (
      SELECT id FROM performance_improvement_plans 
      WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
      OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Managers can manage PIP goals" ON public.pip_goals
  FOR ALL USING (
    pip_id IN (SELECT id FROM performance_improvement_plans WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );

-- RLS Policies for pip_check_ins
CREATE POLICY "Admins can manage all PIP check-ins" ON public.pip_check_ins
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "PIP participants can manage check-ins" ON public.pip_check_ins
  FOR ALL USING (
    pip_id IN (
      SELECT id FROM performance_improvement_plans 
      WHERE manager_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) 
      OR employee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_feedback_cycles_updated_at BEFORE UPDATE ON public.feedback_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_feedback_requests_updated_at BEFORE UPDATE ON public.feedback_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON public.key_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_one_on_one_meetings_updated_at BEFORE UPDATE ON public.one_on_one_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_meeting_action_items_updated_at BEFORE UPDATE ON public.meeting_action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pips_updated_at BEFORE UPDATE ON public.performance_improvement_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pip_goals_updated_at BEFORE UPDATE ON public.pip_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pip_check_ins_updated_at BEFORE UPDATE ON public.pip_check_ins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();