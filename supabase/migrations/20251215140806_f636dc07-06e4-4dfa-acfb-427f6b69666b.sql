-- Fix training_sections RLS: Restrict to same organization
ALTER TABLE public.training_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view training sections" ON public.training_sections;
DROP POLICY IF EXISTS "Public can view training sections" ON public.training_sections;

-- Users can only view training sections in their organization
CREATE POLICY "Users view org training sections" 
ON public.training_sections 
FOR SELECT 
USING (
  organization_id = get_user_organization_id()
  OR is_super_admin()
);

-- Admins can manage training sections in their organization
CREATE POLICY "Admins manage org training sections" 
ON public.training_sections 
FOR ALL 
USING (
  organization_id = get_user_organization_id()
  AND is_any_admin(auth.uid())
);

-- Fix scratch_card_inventory RLS: Restrict to admins only
ALTER TABLE public.scratch_card_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view scratch card inventory" ON public.scratch_card_inventory;
DROP POLICY IF EXISTS "Public can view scratch card inventory" ON public.scratch_card_inventory;

-- Only admins can view inventory
CREATE POLICY "Admins view scratch card inventory" 
ON public.scratch_card_inventory 
FOR SELECT 
USING (is_any_admin(auth.uid()) OR is_super_admin());

-- Only super admins can manage inventory
CREATE POLICY "Super admins manage scratch card inventory" 
ON public.scratch_card_inventory 
FOR ALL 
USING (is_super_admin());