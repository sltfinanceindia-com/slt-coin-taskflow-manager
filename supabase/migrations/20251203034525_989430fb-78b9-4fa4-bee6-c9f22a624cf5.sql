-- =====================================================
-- PHASE 1: CREATE TABLES
-- =====================================================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code subscription_plan_type NOT NULL UNIQUE,
  max_users INTEGER NOT NULL DEFAULT 5,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, code, max_users, price_monthly, price_yearly, features) VALUES
  ('Free', 'free', 5, 0, 0, '["Basic employee management", "5 users max", "Basic training", "Community support"]'::jsonb),
  ('Starter', 'starter', 25, 2499, 24990, '["25 users", "All training features", "Advanced assessments", "Team communication", "Email support"]'::jsonb),
  ('Professional', 'professional', 100, 7499, 74990, '["100 users", "All features", "Advanced analytics", "Custom branding", "Priority support", "API access"]'::jsonb),
  ('Enterprise', 'enterprise', -1, 0, 0, '["Unlimited users", "All features", "Dedicated support", "Custom integrations", "SLA guarantee", "White-label options"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  slug TEXT,
  logo_url TEXT,
  description TEXT,
  primary_color TEXT DEFAULT '#10b981',
  secondary_color TEXT DEFAULT '#059669',
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),
  max_users INTEGER NOT NULL DEFAULT 5,
  status organization_status NOT NULL DEFAULT 'active',
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  billing_email TEXT,
  tax_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_organizations_subdomain ON public.organizations(subdomain);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'intern',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.organization_invitations(token);

-- =====================================================
-- ADD ORGANIZATION_ID TO ALL TABLES
-- =====================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization ON public.profiles(organization_id);

ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization ON public.user_roles(organization_id);

ALTER TABLE public.training_sections ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_training_sections_org ON public.training_sections(organization_id);

ALTER TABLE public.training_videos ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_training_videos_org ON public.training_videos(organization_id);

ALTER TABLE public.training_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_org ON public.training_assignments(organization_id);

ALTER TABLE public.training_progress ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_training_progress_org ON public.training_progress(organization_id);

ALTER TABLE public.training_video_progress ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_training_video_progress_org ON public.training_video_progress(organization_id);

ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_assessments_org ON public.assessments(organization_id);

ALTER TABLE public.assessment_questions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_org ON public.assessment_questions(organization_id);

ALTER TABLE public.assessment_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_org ON public.assessment_assignments(organization_id);

ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_org ON public.assessment_attempts(organization_id);

ALTER TABLE public.assessment_answers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_assessment_answers_org ON public.assessment_answers(organization_id);

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON public.tasks(organization_id);

ALTER TABLE public.task_comments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_task_comments_org ON public.task_comments(organization_id);

ALTER TABLE public.time_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_time_logs_org ON public.time_logs(organization_id);

ALTER TABLE public.coin_transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_org ON public.coin_transactions(organization_id);

ALTER TABLE public.coin_rates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_coin_rates_org ON public.coin_rates(organization_id);

ALTER TABLE public.communication_channels ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_org ON public.communication_channels(organization_id);

ALTER TABLE public.channel_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_channel_members_org ON public.channel_members(organization_id);

ALTER TABLE public.channel_read_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_channel_read_status_org ON public.channel_read_status(organization_id);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_messages_org ON public.messages(organization_id);

ALTER TABLE public.message_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_org ON public.message_attachments(organization_id);

ALTER TABLE public.message_reactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_org ON public.message_reactions(organization_id);

ALTER TABLE public.message_read_receipts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_org ON public.message_read_receipts(organization_id);

ALTER TABLE public.message_states ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_message_states_org ON public.message_states(organization_id);

ALTER TABLE public.message_threads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_message_threads_org ON public.message_threads(organization_id);

ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_groups_org ON public.groups(organization_id);

ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_group_members_org ON public.group_members(organization_id);

ALTER TABLE public.chat_users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_chat_users_org ON public.chat_users(organization_id);

ALTER TABLE public.session_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_session_logs_org ON public.session_logs(organization_id);

ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(organization_id);

ALTER TABLE public.kanban_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_kanban_events_org ON public.kanban_events(organization_id);

ALTER TABLE public.kanban_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_kanban_metrics_org ON public.kanban_metrics(organization_id);

ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON public.calendar_events(organization_id);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);

ALTER TABLE public.admin_notes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_org ON public.admin_notes(organization_id);

ALTER TABLE public.file_attachments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_org ON public.file_attachments(organization_id);

ALTER TABLE public.notification_settings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_org ON public.notification_settings(organization_id);

ALTER TABLE public.daily_email_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_daily_email_log_org ON public.daily_email_log(organization_id);

ALTER TABLE public.email_notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_org ON public.email_notifications(organization_id);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON public.audit_logs(organization_id);