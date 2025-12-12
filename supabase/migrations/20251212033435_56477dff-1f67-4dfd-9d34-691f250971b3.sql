
-- Employee lifecycle playbooks (templates)
CREATE TABLE public.lifecycle_playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('onboarding', 'offboarding')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  role TEXT,
  description TEXT,
  checklist_items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Playbook instances (when applied to an employee)
CREATE TABLE public.lifecycle_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.lifecycle_playbooks(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_completion_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Instance checklist items (individual task progress)
CREATE TABLE public.lifecycle_instance_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.lifecycle_instances(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  item_description TEXT,
  category TEXT,
  assignee_role TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee assets tracking
CREATE TABLE public.employee_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('laptop', 'phone', 'tablet', 'id_card', 'access_card', 'keys', 'monitor', 'headset', 'other')),
  asset_name TEXT NOT NULL,
  serial_number TEXT,
  asset_tag TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  returned_at TIMESTAMPTZ,
  condition_on_assign TEXT,
  condition_on_return TEXT,
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id),
  received_by UUID REFERENCES public.profiles(id),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lifecycle_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_instance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lifecycle_playbooks
CREATE POLICY "Users can view playbooks in their organization"
ON public.lifecycle_playbooks FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage playbooks"
ON public.lifecycle_playbooks FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for lifecycle_instances
CREATE POLICY "Users can view instances in their organization"
ON public.lifecycle_instances FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage instances"
ON public.lifecycle_instances FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for lifecycle_instance_items
CREATE POLICY "Users can view instance items in their organization"
ON public.lifecycle_instance_items FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Assigned users can update their items"
ON public.lifecycle_instance_items FOR UPDATE
USING (
  organization_id = public.get_user_organization_id() 
  AND (assigned_to = public.get_user_profile_id() OR public.is_any_admin(auth.uid()))
);

CREATE POLICY "Admins can manage instance items"
ON public.lifecycle_instance_items FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- RLS Policies for employee_assets
CREATE POLICY "Users can view assets in their organization"
ON public.employee_assets FOR SELECT
USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can manage assets"
ON public.employee_assets FOR ALL
USING (organization_id = public.get_user_organization_id() AND public.is_any_admin(auth.uid()));

-- Indexes
CREATE INDEX idx_lifecycle_playbooks_org ON public.lifecycle_playbooks(organization_id);
CREATE INDEX idx_lifecycle_playbooks_type ON public.lifecycle_playbooks(type);
CREATE INDEX idx_lifecycle_instances_employee ON public.lifecycle_instances(employee_id);
CREATE INDEX idx_lifecycle_instances_status ON public.lifecycle_instances(status);
CREATE INDEX idx_lifecycle_instance_items_instance ON public.lifecycle_instance_items(instance_id);
CREATE INDEX idx_lifecycle_instance_items_assigned ON public.lifecycle_instance_items(assigned_to);
CREATE INDEX idx_employee_assets_employee ON public.employee_assets(employee_id);
CREATE INDEX idx_employee_assets_type ON public.employee_assets(asset_type);

-- Triggers for updated_at
CREATE TRIGGER update_lifecycle_playbooks_updated_at
  BEFORE UPDATE ON public.lifecycle_playbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lifecycle_instances_updated_at
  BEFORE UPDATE ON public.lifecycle_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lifecycle_instance_items_updated_at
  BEFORE UPDATE ON public.lifecycle_instance_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_employee_assets_updated_at
  BEFORE UPDATE ON public.employee_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
