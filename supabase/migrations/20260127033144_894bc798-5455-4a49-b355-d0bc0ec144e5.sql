-- Create project_issues table (used by IssueTracker component)
CREATE TABLE IF NOT EXISTS public.project_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  reported_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_issues
CREATE POLICY "project_issues_select_org" ON public.project_issues FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "project_issues_insert_org" ON public.project_issues FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "project_issues_update_org" ON public.project_issues FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "project_issues_delete_org" ON public.project_issues FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_issues_project ON public.project_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_project_issues_org ON public.project_issues(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_issues_assigned ON public.project_issues(assigned_to);