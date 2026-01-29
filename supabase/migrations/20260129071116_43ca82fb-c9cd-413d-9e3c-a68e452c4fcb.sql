-- Migration: Create sprints table and add org settings columns

-- 1. Create sprints table
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  velocity INTEGER DEFAULT 0,
  total_story_points INTEGER DEFAULT 0,
  completed_story_points INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on sprints
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- RLS policies for sprints
CREATE POLICY "Users can view sprints in their organization"
ON public.sprints FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create sprints in their organization"
ON public.sprints FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update sprints in their organization"
ON public.sprints FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete sprints in their organization"
ON public.sprints FOR DELETE
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 2. Add missing columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'DD/MM/YYYY',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS first_day_of_week INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS enabled_features JSONB DEFAULT '{"training": true, "leave_management": true, "attendance": true, "projects": true, "communication": true, "assessments": true, "coin_rewards": true}'::jsonb,
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email_notifications": true, "daily_digest": true, "task_reminders": true, "announcement_alerts": true}'::jsonb,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{"password_min_length": 8, "require_special_char": true, "session_timeout_minutes": 480, "max_login_attempts": 5}'::jsonb;

-- 3. Create default Comp-Off leave type for each organization (using correct columns)
INSERT INTO public.leave_types (organization_id, name, description, days_per_year, is_paid, is_active)
SELECT 
  o.id,
  'Comp-Off',
  'Compensatory time off for overtime or holiday work',
  12,
  false,
  true
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.leave_types lt 
  WHERE lt.organization_id = o.id 
  AND (LOWER(lt.name) = 'comp-off' OR LOWER(lt.name) = 'comp off' OR LOWER(lt.name) = 'compensatory off')
);

-- 4. Create trigger for sprints updated_at
CREATE OR REPLACE FUNCTION update_sprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sprints_updated_at ON public.sprints;
CREATE TRIGGER set_sprints_updated_at
  BEFORE UPDATE ON public.sprints
  FOR EACH ROW
  EXECUTE FUNCTION update_sprints_updated_at();

-- 5. Create task_templates table if not exists
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  estimated_hours NUMERIC(10,2) DEFAULT 4,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  checklist TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  default_assignee UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on task_templates
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_templates
CREATE POLICY "Users can view task_templates in their organization"
ON public.task_templates FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create task_templates in their organization"
ON public.task_templates FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update task_templates in their organization"
ON public.task_templates FOR UPDATE
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete task_templates in their organization"
ON public.task_templates FOR DELETE
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Trigger for task_templates updated_at
CREATE OR REPLACE FUNCTION update_task_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_task_templates_updated_at ON public.task_templates;
CREATE TRIGGER set_task_templates_updated_at
  BEFORE UPDATE ON public.task_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_task_templates_updated_at();