
-- Project Templates
CREATE TABLE public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_tasks JSONB DEFAULT '[]'::jsonb,
  default_dependencies JSONB DEFAULT '[]'::jsonb,
  default_roles JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general'::text,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Task Templates (bundles of tasks)
CREATE TABLE public.task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tasks JSONB DEFAULT '[]'::jsonb,
  category TEXT DEFAULT 'general'::text,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval Workflows
CREATE TABLE public.approval_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL, -- 'project', 'task', 'request'
  steps JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval Instances (active approval processes)
CREATE TABLE public.approval_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending'::text, -- 'pending', 'approved', 'rejected', 'cancelled'
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Approval Steps (individual step decisions)
CREATE TABLE public.approval_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.approval_instances(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending'::text, -- 'pending', 'approved', 'rejected'
  comments TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_templates
CREATE POLICY "Users can view templates in their org" ON public.project_templates
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage templates" ON public.project_templates
  FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for task_templates
CREATE POLICY "Users can view task templates in their org" ON public.task_templates
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage task templates" ON public.task_templates
  FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for approval_workflows
CREATE POLICY "Users can view workflows in their org" ON public.approval_workflows
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage workflows" ON public.approval_workflows
  FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for approval_instances
CREATE POLICY "Users can view instances in their org" ON public.approval_instances
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create instances" ON public.approval_instances
  FOR INSERT WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage instances" ON public.approval_instances
  FOR ALL USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS Policies for approval_steps
CREATE POLICY "Users can view steps in their org" ON public.approval_steps
  FOR SELECT USING (organization_id = get_my_org_id());

CREATE POLICY "Approvers can update their steps" ON public.approval_steps
  FOR UPDATE USING (approver_id = get_my_profile_id());

CREATE POLICY "System can insert steps" ON public.approval_steps
  FOR INSERT WITH CHECK (organization_id = get_my_org_id());

-- Indexes for performance
CREATE INDEX idx_project_templates_org ON public.project_templates(organization_id);
CREATE INDEX idx_task_templates_org ON public.task_templates(organization_id);
CREATE INDEX idx_approval_workflows_org ON public.approval_workflows(organization_id);
CREATE INDEX idx_approval_instances_entity ON public.approval_instances(entity_id, entity_type);
CREATE INDEX idx_approval_steps_instance ON public.approval_steps(instance_id);
CREATE INDEX idx_approval_steps_approver ON public.approval_steps(approver_id, status);
