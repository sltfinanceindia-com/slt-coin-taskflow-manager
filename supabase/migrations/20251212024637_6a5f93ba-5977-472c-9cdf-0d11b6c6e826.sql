-- Phase 2: Change Requests + Scope Control

-- Change requests table
CREATE TABLE public.change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reason TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'analyzing', 'approved', 'rejected', 'implemented')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  impact_analysis JSONB DEFAULT '{}'::jsonb,
  schedule_impact_days INTEGER DEFAULT 0,
  budget_impact NUMERIC DEFAULT 0,
  resource_impact TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  implemented_at TIMESTAMP WITH TIME ZONE,
  implementation_notes TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Change request approvals table
CREATE TABLE public.change_request_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  change_request_id UUID NOT NULL REFERENCES public.change_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  decided_at TIMESTAMP WITH TIME ZONE,
  step_order INTEGER NOT NULL DEFAULT 1,
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_request_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for change_requests
CREATE POLICY "Users can view change requests in their org"
  ON public.change_requests FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "Users can create change requests"
  ON public.change_requests FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Users can update their own draft requests"
  ON public.change_requests FOR UPDATE
  USING (
    (requested_by = get_my_profile_id() AND status = 'draft')
    OR is_any_admin(auth.uid())
  );

CREATE POLICY "Admins can delete change requests"
  ON public.change_requests FOR DELETE
  USING (is_any_admin(auth.uid()));

-- RLS Policies for change_request_approvals
CREATE POLICY "Users can view approvals in their org"
  ON public.change_request_approvals FOR SELECT
  USING (organization_id = get_my_org_id());

CREATE POLICY "System can create approvals"
  ON public.change_request_approvals FOR INSERT
  WITH CHECK (organization_id = get_my_org_id());

CREATE POLICY "Approvers can update their approvals"
  ON public.change_request_approvals FOR UPDATE
  USING (approver_id = get_my_profile_id() OR is_any_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_change_requests_project ON public.change_requests(project_id);
CREATE INDEX idx_change_requests_status ON public.change_requests(status);
CREATE INDEX idx_change_requests_org ON public.change_requests(organization_id);
CREATE INDEX idx_change_request_approvals_request ON public.change_request_approvals(change_request_id);

-- Update trigger for change_requests
CREATE TRIGGER update_change_requests_updated_at
  BEFORE UPDATE ON public.change_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();