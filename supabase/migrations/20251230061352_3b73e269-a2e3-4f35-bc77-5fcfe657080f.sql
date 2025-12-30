-- Add parent_task_id for subtasks hierarchy
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Create index for subtask queries
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);

-- Task Checklists table
CREATE TABLE IF NOT EXISTS public.task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on task_checklists
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_checklists
CREATE POLICY "Users can view checklists in their org" ON public.task_checklists
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create checklists in their org" ON public.task_checklists
  FOR INSERT WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update checklists in their org" ON public.task_checklists
  FOR UPDATE USING (organization_id = get_my_org_id());

CREATE POLICY "Users can delete checklists in their org" ON public.task_checklists
  FOR DELETE USING (organization_id = get_my_org_id());

-- Task Recurrence Rules table
CREATE TABLE IF NOT EXISTS public.task_recurrence_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
  interval_value INTEGER DEFAULT 1,
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  day_of_month INTEGER,
  end_date DATE,
  next_occurrence DATE,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on task_recurrence_rules
ALTER TABLE public.task_recurrence_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_recurrence_rules
CREATE POLICY "Users can view recurrence rules in their org" ON public.task_recurrence_rules
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create recurrence rules in their org" ON public.task_recurrence_rules
  FOR INSERT WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update recurrence rules in their org" ON public.task_recurrence_rules
  FOR UPDATE USING (organization_id = get_my_org_id());

CREATE POLICY "Users can delete recurrence rules in their org" ON public.task_recurrence_rules
  FOR DELETE USING (organization_id = get_my_org_id());

-- Custom Field Definitions table
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'email')),
  options JSONB DEFAULT '[]'::jsonb, -- for dropdown options
  is_required BOOLEAN DEFAULT false,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'employee')),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name, entity_type)
);

-- Enable RLS on custom_field_definitions
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_field_definitions
CREATE POLICY "Users can view custom fields in their org" ON public.custom_field_definitions
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage custom fields" ON public.custom_field_definitions
  FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- Custom Field Values table
CREATE TABLE IF NOT EXISTS public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('task', 'project', 'employee')),
  value JSONB,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(field_id, entity_id)
);

-- Enable RLS on custom_field_values
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_field_values
CREATE POLICY "Users can view custom field values in their org" ON public.custom_field_values
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users can manage custom field values in their org" ON public.custom_field_values
  FOR ALL USING (organization_id = get_my_org_id());

-- Dashboard Layouts table
CREATE TABLE IF NOT EXISTS public.dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb, -- widget positions and sizes
  is_default BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on dashboard_layouts
ALTER TABLE public.dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for dashboard_layouts
CREATE POLICY "Users can manage their own layouts" ON public.dashboard_layouts
  FOR ALL USING (user_id = get_my_profile_id());

-- Project Milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on project_milestones
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_milestones
CREATE POLICY "Users can view milestones in their org" ON public.project_milestones
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users can manage milestones in their org" ON public.project_milestones
  FOR ALL USING (organization_id = get_my_org_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_checklists_task_id ON public.task_checklists(task_id);
CREATE INDEX IF NOT EXISTS idx_task_recurrence_rules_task_id ON public.task_recurrence_rules(task_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_org ON public.custom_field_definitions(organization_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON public.custom_field_values(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user ON public.dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);