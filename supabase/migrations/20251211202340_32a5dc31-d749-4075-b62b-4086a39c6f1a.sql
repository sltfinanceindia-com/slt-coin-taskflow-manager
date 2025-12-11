
-- Phase 4: Request Intake & Work Routing

-- Request types configuration
CREATE TABLE IF NOT EXISTS public.request_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT '#6366f1',
  form_fields JSONB DEFAULT '[]'::jsonb,
  default_assignee_id UUID REFERENCES public.profiles(id),
  default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
  auto_route_rules JSONB DEFAULT '{}'::jsonb,
  sla_response_hours INTEGER DEFAULT 24,
  sla_resolution_hours INTEGER DEFAULT 72,
  requires_approval BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(name, organization_id)
);

-- Work requests
CREATE TABLE IF NOT EXISTS public.work_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL,
  request_type_id UUID NOT NULL REFERENCES public.request_types(id),
  title TEXT NOT NULL,
  description TEXT,
  requester_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'triaging', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  form_data JSONB DEFAULT '{}'::jsonb,
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_team TEXT,
  converted_to_task_id UUID REFERENCES public.tasks(id),
  converted_to_project_id UUID REFERENCES public.projects(id),
  sla_response_due TIMESTAMP WITH TIME ZONE,
  sla_resolution_due TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  triage_notes TEXT,
  triaged_by UUID REFERENCES public.profiles(id),
  triaged_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA breach tracking
CREATE TABLE IF NOT EXISTS public.sla_breaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.work_requests(id) ON DELETE CASCADE,
  breach_type TEXT NOT NULL CHECK (breach_type IN ('response', 'resolution')),
  expected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  breached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  breach_duration_minutes INTEGER,
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_breaches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for request_types
CREATE POLICY "Users can view active request types in their organization"
  ON public.request_types FOR SELECT
  USING (organization_id = public.get_user_organization_id() AND is_active = true);

CREATE POLICY "Admins can manage request types"
  ON public.request_types FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for work_requests
CREATE POLICY "Users can view requests in their organization"
  ON public.work_requests FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can create requests"
  ON public.work_requests FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update own requests or admins can update any"
  ON public.work_requests FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id() 
    AND (requester_id = public.get_user_profile_id() OR public.is_any_admin(auth.uid()))
  );

CREATE POLICY "Admins can delete requests"
  ON public.work_requests FOR DELETE
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for sla_breaches
CREATE POLICY "Users can view SLA breaches in their organization"
  ON public.sla_breaches FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "System can manage SLA breaches"
  ON public.sla_breaches FOR ALL
  USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_types_org ON public.request_types(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_org ON public.work_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_status ON public.work_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_requests_requester ON public.work_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_assigned ON public.work_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_requests_type ON public.work_requests(request_type_id);
CREATE INDEX IF NOT EXISTS idx_work_requests_sla_response ON public.work_requests(sla_response_due) WHERE first_response_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_work_requests_sla_resolution ON public.work_requests(sla_resolution_due) WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sla_breaches_request ON public.sla_breaches(request_id);

-- Sequence for request numbers
CREATE SEQUENCE IF NOT EXISTS work_request_number_seq START 1000;

-- Function to generate request number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.request_number := 'REQ-' || LPAD(nextval('work_request_number_seq')::TEXT, 6, '0');
  
  -- Set SLA due dates based on request type
  IF NEW.sla_response_due IS NULL OR NEW.sla_resolution_due IS NULL THEN
    SELECT 
      NEW.created_at + (COALESCE(rt.sla_response_hours, 24) * INTERVAL '1 hour'),
      NEW.created_at + (COALESCE(rt.sla_resolution_hours, 72) * INTERVAL '1 hour')
    INTO NEW.sla_response_due, NEW.sla_resolution_due
    FROM request_types rt
    WHERE rt.id = NEW.request_type_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_request_number
  BEFORE INSERT ON public.work_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_request_number();

-- Function to check and record SLA breaches
CREATE OR REPLACE FUNCTION public.check_sla_breaches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check for response SLA breaches
  INSERT INTO sla_breaches (request_id, breach_type, expected_at, breach_duration_minutes, organization_id)
  SELECT 
    wr.id,
    'response',
    wr.sla_response_due,
    EXTRACT(EPOCH FROM (now() - wr.sla_response_due)) / 60,
    wr.organization_id
  FROM work_requests wr
  WHERE wr.first_response_at IS NULL
    AND wr.sla_response_due < now()
    AND wr.status NOT IN ('completed', 'cancelled', 'rejected')
    AND NOT EXISTS (
      SELECT 1 FROM sla_breaches sb 
      WHERE sb.request_id = wr.id AND sb.breach_type = 'response'
    );

  -- Check for resolution SLA breaches
  INSERT INTO sla_breaches (request_id, breach_type, expected_at, breach_duration_minutes, organization_id)
  SELECT 
    wr.id,
    'resolution',
    wr.sla_resolution_due,
    EXTRACT(EPOCH FROM (now() - wr.sla_resolution_due)) / 60,
    wr.organization_id
  FROM work_requests wr
  WHERE wr.resolved_at IS NULL
    AND wr.sla_resolution_due < now()
    AND wr.status NOT IN ('completed', 'cancelled', 'rejected')
    AND NOT EXISTS (
      SELECT 1 FROM sla_breaches sb 
      WHERE sb.request_id = wr.id AND sb.breach_type = 'resolution'
    );
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_work_requests_updated_at
  BEFORE UPDATE ON public.work_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default request types
INSERT INTO public.request_types (name, description, icon, color, sla_response_hours, sla_resolution_hours, organization_id)
SELECT 
  unnest(ARRAY['IT Support', 'HR Request', 'Marketing Request', 'Finance Request', 'General Inquiry']),
  unnest(ARRAY['Technical support and IT issues', 'HR-related requests', 'Marketing campaign requests', 'Budget and expense requests', 'General questions and requests']),
  unnest(ARRAY['Monitor', 'Users', 'Megaphone', 'DollarSign', 'HelpCircle']),
  unnest(ARRAY['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6']),
  unnest(ARRAY[8, 24, 24, 24, 24]),
  unnest(ARRAY[48, 72, 96, 72, 48]),
  o.id
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM request_types WHERE organization_id = o.id)
LIMIT 1;
