-- AI Integration Tables

-- AI conversation history for chatbot
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_id uuid DEFAULT gen_random_uuid(),
  messages jsonb DEFAULT '[]'::jsonb,
  context text,
  conversation_type text DEFAULT 'general', -- general, hr_support, performance, onboarding
  metadata jsonb DEFAULT '{}',
  is_resolved boolean DEFAULT false,
  escalated_to uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI-generated insights cache
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_type text NOT NULL, -- sentiment, attrition_risk, performance, workforce
  entity_type text, -- employee, department, team, organization
  entity_id uuid,
  title text NOT NULL,
  content jsonb NOT NULL,
  confidence_score numeric(3,2),
  severity text DEFAULT 'info', -- info, warning, critical
  is_actionable boolean DEFAULT false,
  action_taken boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Resume/CV analysis results
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES public.profiles(id),
  document_url text,
  candidate_name text,
  candidate_email text,
  extracted_skills text[],
  experience_years numeric,
  education jsonb,
  experience_summary text,
  ai_match_score numeric(3,2),
  job_fit_analysis jsonb,
  interview_questions jsonb,
  recommendations jsonb,
  status text DEFAULT 'pending', -- pending, analyzed, reviewed, archived
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI usage tracking for rate limiting and analytics
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  feature_type text NOT NULL, -- chatbot, composer, document_gen, resume_analyzer
  action text NOT NULL,
  tokens_used integer,
  response_time_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (user_id = auth.uid() OR is_same_org_admin(organization_id));

CREATE POLICY "Users can create own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON public.ai_conversations
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for ai_insights
CREATE POLICY "Admins can view org insights" ON public.ai_insights
  FOR SELECT USING (is_same_org_admin(organization_id));

CREATE POLICY "System can create insights" ON public.ai_insights
  FOR INSERT WITH CHECK (true);

-- RLS Policies for resume_analyses
CREATE POLICY "HR can view resume analyses" ON public.resume_analyses
  FOR SELECT USING (is_same_org_admin(organization_id) OR uploaded_by = auth.uid());

CREATE POLICY "HR can create resume analyses" ON public.resume_analyses
  FOR INSERT WITH CHECK (is_same_org_admin(organization_id));

CREATE POLICY "HR can update resume analyses" ON public.resume_analyses
  FOR UPDATE USING (is_same_org_admin(organization_id));

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view own usage" ON public.ai_usage_logs
  FOR SELECT USING (user_id = auth.uid() OR is_same_org_admin(organization_id));

CREATE POLICY "System can create usage logs" ON public.ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org ON public.ai_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON public.ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_org ON public.resume_analyses(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON public.ai_usage_logs(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resume_analyses_updated_at
  BEFORE UPDATE ON public.resume_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();