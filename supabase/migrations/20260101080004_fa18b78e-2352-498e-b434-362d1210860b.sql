-- =============================================
-- FEATURE 1: KUDOS & RECOGNITION WALL
-- =============================================
CREATE TABLE public.kudos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  badge_type TEXT NOT NULL DEFAULT 'appreciation',
  is_public BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kudos
CREATE POLICY "Users can view kudos in their organization"
  ON public.kudos FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create kudos in their organization"
  ON public.kudos FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id() 
    AND from_user_id = public.get_user_profile_id()
  );

CREATE POLICY "Users can delete their own kudos"
  ON public.kudos FOR DELETE
  USING (from_user_id = public.get_user_profile_id());

-- Index for faster queries
CREATE INDEX idx_kudos_organization_id ON public.kudos(organization_id);
CREATE INDEX idx_kudos_to_user_id ON public.kudos(to_user_id);
CREATE INDEX idx_kudos_created_at ON public.kudos(created_at DESC);

-- =============================================
-- FEATURE 2: PULSE SURVEYS
-- =============================================
CREATE TABLE public.pulse_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'weekly',
  start_date DATE,
  end_date DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.pulse_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  sentiment_score NUMERIC(3,2),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(survey_id, user_id)
);

-- Enable RLS
ALTER TABLE public.pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_surveys
CREATE POLICY "Users can view active surveys in their organization"
  ON public.pulse_surveys FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage surveys"
  ON public.pulse_surveys FOR ALL
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- RLS Policies for pulse_responses
CREATE POLICY "Users can view their own responses"
  ON public.pulse_responses FOR SELECT
  USING (user_id = public.get_user_profile_id());

CREATE POLICY "Admins can view all responses in organization"
  ON public.pulse_responses FOR SELECT
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

CREATE POLICY "Users can submit responses"
  ON public.pulse_responses FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id() 
    AND user_id = public.get_user_profile_id()
  );

-- Indexes
CREATE INDEX idx_pulse_surveys_org ON public.pulse_surveys(organization_id);
CREATE INDEX idx_pulse_responses_survey ON public.pulse_responses(survey_id);
CREATE INDEX idx_pulse_responses_user ON public.pulse_responses(user_id);

-- =============================================
-- FEATURE 3: PERSONAL GOALS (without OKR link)
-- =============================================
CREATE TABLE public.personal_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own goals"
  ON public.personal_goals FOR ALL
  USING (user_id = public.get_user_profile_id());

CREATE POLICY "Admins can view all goals in organization"
  ON public.personal_goals FOR SELECT
  USING (
    organization_id = public.get_user_organization_id() 
    AND public.is_any_admin(auth.uid())
  );

-- Indexes
CREATE INDEX idx_personal_goals_user ON public.personal_goals(user_id);
CREATE INDEX idx_personal_goals_status ON public.personal_goals(status);

-- =============================================
-- FEATURE 4: DASHBOARD WIDGETS
-- =============================================
CREATE TABLE public.dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own widgets"
  ON public.dashboard_widgets FOR ALL
  USING (user_id = public.get_user_profile_id());

-- Index
CREATE INDEX idx_dashboard_widgets_user ON public.dashboard_widgets(user_id);

-- =============================================
-- FEATURE 5: NOTIFICATION PREFERENCES
-- =============================================
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  digest_enabled BOOLEAN DEFAULT false,
  digest_frequency TEXT DEFAULT 'daily',
  preferences JSONB DEFAULT '{
    "task_assigned": {"email": true, "push": true, "in_app": true},
    "task_completed": {"email": true, "push": true, "in_app": true},
    "mention": {"email": true, "push": true, "in_app": true},
    "kudos_received": {"email": true, "push": true, "in_app": true},
    "leave_approved": {"email": true, "push": false, "in_app": true},
    "announcement": {"email": true, "push": true, "in_app": true}
  }',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (user_id = public.get_user_profile_id());

-- Triggers for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_personal_goals_updated_at
  BEFORE UPDATE ON public.personal_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pulse_surveys_updated_at
  BEFORE UPDATE ON public.pulse_surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();