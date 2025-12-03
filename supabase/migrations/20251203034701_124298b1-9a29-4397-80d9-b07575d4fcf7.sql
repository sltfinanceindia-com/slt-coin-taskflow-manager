-- Add organization_id to user_presence table
ALTER TABLE public.user_presence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
CREATE INDEX IF NOT EXISTS idx_user_presence_org ON public.user_presence(organization_id);

-- Migrate user_presence data
UPDATE public.user_presence SET organization_id = (
  SELECT id FROM public.organizations WHERE subdomain = 'slt-finance' LIMIT 1
) WHERE organization_id IS NULL;