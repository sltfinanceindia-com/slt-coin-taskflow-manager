-- Phase 6: Data Isolation - Add organization_id to remaining tables and create indexes

-- Add organization_id to time_logs if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_logs' AND column_name = 'organization_id') THEN
    ALTER TABLE public.time_logs ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
  END IF;
END $$;

-- Add organization_id to user_presence if not exists  
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_presence' AND column_name = 'organization_id') THEN
    ALTER TABLE public.user_presence ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
  END IF;
END $$;

-- Add organization_id to typing_indicators if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'typing_indicators' AND column_name = 'organization_id') THEN
    ALTER TABLE public.typing_indicators ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
  END IF;
END $$;

-- Create helper function for getting user profile id
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Update data: Set organization_id for existing records based on user's organization
UPDATE public.time_logs tl
SET organization_id = (SELECT organization_id FROM public.profiles WHERE id = tl.user_id LIMIT 1)
WHERE organization_id IS NULL;

UPDATE public.user_presence up
SET organization_id = (SELECT organization_id FROM public.profiles WHERE id = up.user_id LIMIT 1)
WHERE organization_id IS NULL;

UPDATE public.typing_indicators ti
SET organization_id = (SELECT organization_id FROM public.profiles WHERE id = ti.user_id LIMIT 1)
WHERE organization_id IS NULL;

-- Create indexes for organization_id on key tables for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_sections_organization_id ON public.training_sections(organization_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_organization_id ON public.training_videos(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON public.messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_organization_id ON public.coin_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_organization_id ON public.assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_organization_id ON public.session_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_organization_id ON public.time_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_organization_id ON public.user_presence(organization_id);