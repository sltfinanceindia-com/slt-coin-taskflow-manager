-- =====================================================
-- ENTERPRISE FEATURE EXPANSION - PHASE 1
-- Service Desk, Financials, GRC, Entity Collaboration
-- =====================================================

-- 1. Clients table (for project billing)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  billing_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Knowledge Base (required for Service Desk)
CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Strategic Alignment: Link portfolios and projects to OKRs
CREATE TABLE IF NOT EXISTS public.portfolio_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  alignment_score DECIMAL(3,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  UNIQUE(portfolio_id, objective_id)
);

CREATE TABLE IF NOT EXISTS public.project_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  contribution_weight DECIMAL(3,2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  UNIQUE(project_id, objective_id)
);

-- 4. Service Desk & Ticketing
CREATE TABLE IF NOT EXISTS public.sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('incident', 'request', 'change', 'problem')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  response_hours INTEGER NOT NULL DEFAULT 24,
  resolution_hours INTEGER NOT NULL DEFAULT 72,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  ticket_number TEXT NOT NULL,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('incident', 'request', 'change', 'problem')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled')),
  requester_id UUID REFERENCES public.profiles(id),
  assignee_id UUID REFERENCES public.profiles(id),
  sla_rule_id UUID REFERENCES public.sla_rules(id),
  sla_response_due TIMESTAMPTZ,
  sla_resolution_due TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  category TEXT,
  subcategory TEXT,
  knowledge_article_id UUID REFERENCES public.knowledge_articles(id),
  is_major_incident BOOLEAN DEFAULT false,
  root_cause TEXT,
  resolution_notes TEXT,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_tickets_org ON public.service_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON public.service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_service_tickets_assignee ON public.service_tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_requester ON public.service_tickets(requester_id);

-- 5. Role-based Resource Planning
CREATE TABLE IF NOT EXISTS public.resource_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(10,2),
  skill_requirements TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_role_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.resource_roles(id),
  allocated_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  allocation_type TEXT NOT NULL DEFAULT 'soft' CHECK (allocation_type IN ('soft', 'hard')),
  week_start DATE NOT NULL,
  assigned_user_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_project_role_allocations_project ON public.project_role_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_role_allocations_week ON public.project_role_allocations(week_start);

-- 6. Project Financials
CREATE TABLE IF NOT EXISTS public.project_cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('labor', 'non_labor')),
  category TEXT CHECK (category IN ('capex', 'opex')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date_incurred DATE NOT NULL,
  is_forecast BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

CREATE TABLE IF NOT EXISTS public.project_revenue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  billing_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'forecast' CHECK (status IN ('forecast', 'invoiced', 'paid')),
  invoice_number TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_project_cost_items_project ON public.project_cost_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_revenue_items_project ON public.project_revenue_items(project_id);

-- 7. Playbooks (Templates + KB)
CREATE TABLE IF NOT EXISTS public.playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  template_id UUID REFERENCES public.project_templates(id),
  kb_article_ids UUID[],
  steps JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. GRC Compliance
CREATE TABLE IF NOT EXISTS public.compliance_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  regulation TEXT,
  required_stage TEXT CHECK (required_stage IN ('initiation', 'planning', 'design', 'build', 'test', 'deploy', 'closure')),
  is_mandatory BOOLEAN DEFAULT true,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_compliance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  checkpoint_id UUID NOT NULL REFERENCES public.compliance_checkpoints(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'waived', 'not_applicable')),
  completed_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  waiver_approved_by UUID REFERENCES public.profiles(id),
  waiver_reason TEXT,
  notes TEXT,
  evidence_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  UNIQUE(project_id, checkpoint_id)
);

-- 9. Entity Comments (Generic for all entities)
CREATE TABLE IF NOT EXISTS public.entity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'ticket', 'request', 'risk', 'issue', 'milestone', 'program', 'portfolio')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  mentions UUID[],
  attachments JSONB DEFAULT '[]'::jsonb,
  is_decision BOOLEAN DEFAULT false,
  decision_approved_by UUID REFERENCES public.profiles(id),
  parent_comment_id UUID REFERENCES public.entity_comments(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_entity_comments_entity ON public.entity_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_comments_user ON public.entity_comments(user_id);

-- 10. Entity Followers
CREATE TABLE IF NOT EXISTS public.entity_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'ticket', 'request', 'risk', 'issue', 'milestone', 'program', 'portfolio', 'task')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id),
  UNIQUE(entity_type, entity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_followers_entity ON public.entity_followers(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_followers_user ON public.entity_followers(user_id);

-- 11. Extend existing tables
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS objective_id UUID REFERENCES public.objectives(id),
  ADD COLUMN IF NOT EXISTS capex_budget DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opex_budget DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS billing_model TEXT CHECK (billing_model IN ('fixed_price', 'time_material', 'retainer', 'internal')),
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);

ALTER TABLE public.work_requests
  ADD COLUMN IF NOT EXISTS effort_score INTEGER CHECK (effort_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS value_score INTEGER CHECK (value_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS compliance_impact BOOLEAN DEFAULT false;

ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS strategic_alignment_score DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS nps_score DECIMAL(4,1),
  ADD COLUMN IF NOT EXISTS schedule_health TEXT CHECK (schedule_health IN ('on_track', 'at_risk', 'delayed'));

-- 12. Enable RLS on new tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_role_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_revenue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_compliance_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_followers ENABLE ROW LEVEL SECURITY;

-- 13. RLS Policies for all new tables
CREATE POLICY "Users can view org clients" ON public.clients FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org clients" ON public.clients FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org knowledge_articles" ON public.knowledge_articles FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org knowledge_articles" ON public.knowledge_articles FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org portfolio_objectives" ON public.portfolio_objectives FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org portfolio_objectives" ON public.portfolio_objectives FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org project_objectives" ON public.project_objectives FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org project_objectives" ON public.project_objectives FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org sla_rules" ON public.sla_rules FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org sla_rules" ON public.sla_rules FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org service_tickets" ON public.service_tickets FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org service_tickets" ON public.service_tickets FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org resource_roles" ON public.resource_roles FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org resource_roles" ON public.resource_roles FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org project_role_allocations" ON public.project_role_allocations FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org project_role_allocations" ON public.project_role_allocations FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org project_cost_items" ON public.project_cost_items FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org project_cost_items" ON public.project_cost_items FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org project_revenue_items" ON public.project_revenue_items FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org project_revenue_items" ON public.project_revenue_items FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org playbooks" ON public.playbooks FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org playbooks" ON public.playbooks FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org compliance_checkpoints" ON public.compliance_checkpoints FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org compliance_checkpoints" ON public.compliance_checkpoints FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org project_compliance_status" ON public.project_compliance_status FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org project_compliance_status" ON public.project_compliance_status FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org entity_comments" ON public.entity_comments FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org entity_comments" ON public.entity_comments FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view org entity_followers" ON public.entity_followers FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage org entity_followers" ON public.entity_followers FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- 14. Functions for ticket number generation
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  CASE NEW.ticket_type
    WHEN 'incident' THEN prefix := 'INC';
    WHEN 'request' THEN prefix := 'REQ';
    WHEN 'change' THEN prefix := 'CHG';
    WHEN 'problem' THEN prefix := 'PRB';
    ELSE prefix := 'TKT';
  END CASE;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.service_tickets
  WHERE organization_id = NEW.organization_id
    AND ticket_type = NEW.ticket_type;
  
  NEW.ticket_number := prefix || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_ticket_number ON public.service_tickets;
CREATE TRIGGER set_ticket_number
BEFORE INSERT ON public.service_tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
EXECUTE FUNCTION generate_ticket_number();

-- 15. Function to calculate SLA deadlines
CREATE OR REPLACE FUNCTION set_sla_deadlines()
RETURNS TRIGGER AS $$
DECLARE
  rule RECORD;
BEGIN
  SELECT * INTO rule
  FROM public.sla_rules
  WHERE organization_id = NEW.organization_id
    AND ticket_type = NEW.ticket_type
    AND priority = NEW.priority
    AND is_active = true
  LIMIT 1;
  
  IF FOUND THEN
    NEW.sla_rule_id := rule.id;
    NEW.sla_response_due := NEW.created_at + (rule.response_hours * INTERVAL '1 hour');
    NEW.sla_resolution_due := NEW.created_at + (rule.resolution_hours * INTERVAL '1 hour');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS apply_sla_rules ON public.service_tickets;
CREATE TRIGGER apply_sla_rules
BEFORE INSERT ON public.service_tickets
FOR EACH ROW
EXECUTE FUNCTION set_sla_deadlines();

-- 16. Updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_articles_updated_at ON public.knowledge_articles;
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON public.knowledge_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_objectives_updated_at ON public.portfolio_objectives;
CREATE TRIGGER update_portfolio_objectives_updated_at BEFORE UPDATE ON public.portfolio_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_objectives_updated_at ON public.project_objectives;
CREATE TRIGGER update_project_objectives_updated_at BEFORE UPDATE ON public.project_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sla_rules_updated_at ON public.sla_rules;
CREATE TRIGGER update_sla_rules_updated_at BEFORE UPDATE ON public.sla_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_tickets_updated_at ON public.service_tickets;
CREATE TRIGGER update_service_tickets_updated_at BEFORE UPDATE ON public.service_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resource_roles_updated_at ON public.resource_roles;
CREATE TRIGGER update_resource_roles_updated_at BEFORE UPDATE ON public.resource_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_role_allocations_updated_at ON public.project_role_allocations;
CREATE TRIGGER update_project_role_allocations_updated_at BEFORE UPDATE ON public.project_role_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_cost_items_updated_at ON public.project_cost_items;
CREATE TRIGGER update_project_cost_items_updated_at BEFORE UPDATE ON public.project_cost_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_revenue_items_updated_at ON public.project_revenue_items;
CREATE TRIGGER update_project_revenue_items_updated_at BEFORE UPDATE ON public.project_revenue_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_playbooks_updated_at ON public.playbooks;
CREATE TRIGGER update_playbooks_updated_at BEFORE UPDATE ON public.playbooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compliance_checkpoints_updated_at ON public.compliance_checkpoints;
CREATE TRIGGER update_compliance_checkpoints_updated_at BEFORE UPDATE ON public.compliance_checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_compliance_status_updated_at ON public.project_compliance_status;
CREATE TRIGGER update_project_compliance_status_updated_at BEFORE UPDATE ON public.project_compliance_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entity_comments_updated_at ON public.entity_comments;
CREATE TRIGGER update_entity_comments_updated_at BEFORE UPDATE ON public.entity_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();