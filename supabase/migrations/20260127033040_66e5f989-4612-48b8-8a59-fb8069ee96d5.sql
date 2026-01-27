-- Create milestones table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completion_percentage INTEGER DEFAULT 0,
  deliverables TEXT[],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_risks table
CREATE TABLE IF NOT EXISTS public.project_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'technical',
  probability TEXT NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'identified',
  mitigation_plan TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  identified_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  issue_type TEXT NOT NULL DEFAULT 'bug',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assignee_id UUID REFERENCES public.profiles(id),
  reporter_id UUID REFERENCES public.profiles(id),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for milestones
CREATE POLICY "milestones_select_org" ON public.milestones FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "milestones_insert_org" ON public.milestones FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "milestones_update_org" ON public.milestones FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "milestones_delete_org" ON public.milestones FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS policies for project_risks
CREATE POLICY "risks_select_org" ON public.project_risks FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "risks_insert_org" ON public.project_risks FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "risks_update_org" ON public.project_risks FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "risks_delete_org" ON public.project_risks FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- RLS policies for issues
CREATE POLICY "issues_select_org" ON public.issues FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "issues_insert_org" ON public.issues FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "issues_update_org" ON public.issues FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "issues_delete_org" ON public.issues FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_org ON public.milestones(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_project ON public.project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_risks_org ON public.project_risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_issues_project ON public.issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_org ON public.issues(organization_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON public.issues(assignee_id);