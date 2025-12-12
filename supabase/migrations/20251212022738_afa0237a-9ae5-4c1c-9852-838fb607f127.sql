-- CSAT/Ticket feedback table
CREATE TABLE public.ticket_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.work_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Request routing rules table
CREATE TABLE public.request_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type_id UUID NOT NULL REFERENCES public.request_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition_field TEXT NOT NULL,
  condition_operator TEXT NOT NULL DEFAULT 'equals',
  condition_value TEXT NOT NULL,
  assign_to_user_id UUID REFERENCES public.profiles(id),
  assign_to_team TEXT,
  priority_override TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add draft and approval tracking columns to work_requests
ALTER TABLE public.work_requests 
ADD COLUMN IF NOT EXISTS draft_saved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'submitted',
ADD COLUMN IF NOT EXISTS csat_rating INTEGER,
ADD COLUMN IF NOT EXISTS csat_submitted_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.ticket_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_routing_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for ticket_feedback
CREATE POLICY "Users can view feedback in their org"
ON public.ticket_feedback FOR SELECT
USING (organization_id = get_my_org_id());

CREATE POLICY "Users can submit feedback for their requests"
ON public.ticket_feedback FOR INSERT
WITH CHECK (
  organization_id = get_my_org_id() AND
  submitted_by = get_my_profile_id()
);

CREATE POLICY "Admins can manage all feedback"
ON public.ticket_feedback FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- RLS policies for request_routing_rules
CREATE POLICY "Users can view routing rules in their org"
ON public.request_routing_rules FOR SELECT
USING (organization_id = get_my_org_id());

CREATE POLICY "Admins can manage routing rules"
ON public.request_routing_rules FOR ALL
USING (is_any_admin(auth.uid()) AND organization_id = get_my_org_id());

-- Create indexes for performance
CREATE INDEX idx_ticket_feedback_request_id ON public.ticket_feedback(request_id);
CREATE INDEX idx_ticket_feedback_org ON public.ticket_feedback(organization_id);
CREATE INDEX idx_routing_rules_request_type ON public.request_routing_rules(request_type_id);
CREATE INDEX idx_routing_rules_org ON public.request_routing_rules(organization_id);
CREATE INDEX idx_work_requests_lifecycle ON public.work_requests(lifecycle_stage);

-- Function to calculate SLA metrics
CREATE OR REPLACE FUNCTION public.get_sla_metrics(p_org_id UUID, p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', p_end_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_requests BIGINT,
  response_sla_met BIGINT,
  resolution_sla_met BIGINT,
  response_sla_breached BIGINT,
  resolution_sla_breached BIGINT,
  avg_response_hours NUMERIC,
  avg_resolution_hours NUMERIC,
  avg_csat_rating NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE first_response_at IS NOT NULL AND first_response_at <= sla_response_due)::BIGINT as response_sla_met,
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND resolved_at <= sla_resolution_due)::BIGINT as resolution_sla_met,
    COUNT(*) FILTER (WHERE first_response_at IS NULL AND sla_response_due < now() OR first_response_at > sla_response_due)::BIGINT as response_sla_breached,
    COUNT(*) FILTER (WHERE resolved_at IS NULL AND sla_resolution_due < now() OR resolved_at > sla_resolution_due)::BIGINT as resolution_sla_breached,
    ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600)::NUMERIC, 2) as avg_response_hours,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::NUMERIC, 2) as avg_resolution_hours,
    ROUND(AVG(csat_rating)::NUMERIC, 2) as avg_csat_rating
  FROM work_requests
  WHERE organization_id = p_org_id
    AND created_at::DATE BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Function to apply routing rules
CREATE OR REPLACE FUNCTION public.apply_routing_rules(p_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_request RECORD;
  v_rule RECORD;
  v_field_value TEXT;
BEGIN
  -- Get the request
  SELECT * INTO v_request FROM work_requests WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find matching routing rules
  FOR v_rule IN 
    SELECT * FROM request_routing_rules 
    WHERE request_type_id = v_request.request_type_id 
      AND is_active = true
      AND organization_id = v_request.organization_id
    ORDER BY sort_order ASC
  LOOP
    -- Get field value based on condition_field
    CASE v_rule.condition_field
      WHEN 'priority' THEN v_field_value := v_request.priority;
      WHEN 'status' THEN v_field_value := v_request.status;
      ELSE v_field_value := NULL;
    END CASE;
    
    -- Check if condition matches
    IF v_field_value IS NOT NULL AND (
      (v_rule.condition_operator = 'equals' AND v_field_value = v_rule.condition_value) OR
      (v_rule.condition_operator = 'contains' AND v_field_value ILIKE '%' || v_rule.condition_value || '%')
    ) THEN
      -- Apply the rule
      UPDATE work_requests 
      SET 
        assigned_to = COALESCE(v_rule.assign_to_user_id, assigned_to),
        priority = COALESCE(v_rule.priority_override, priority)
      WHERE id = p_request_id;
      
      EXIT; -- Stop after first matching rule
    END IF;
  END LOOP;
END;
$$;