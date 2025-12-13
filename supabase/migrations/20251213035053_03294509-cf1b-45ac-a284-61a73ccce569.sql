-- Create subscription_metrics table for historical tracking
CREATE TABLE IF NOT EXISTS public.subscription_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  mrr DECIMAL(10,2) DEFAULT 0,
  arr DECIMAL(10,2) DEFAULT 0,
  active_subscriptions INTEGER DEFAULT 0,
  trial_conversions INTEGER DEFAULT 0,
  churned_subscriptions INTEGER DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization_domains table for subdomain publishing
CREATE TABLE IF NOT EXISTS public.organization_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  subdomain TEXT NOT NULL,
  custom_domain TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  dns_verified BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;

-- RLS policies for super_admin only
CREATE POLICY "Super admins can manage subscription_metrics"
ON public.subscription_metrics
FOR ALL
USING (public.is_super_admin());

CREATE POLICY "Super admins can manage organization_domains"
ON public.organization_domains
FOR ALL
USING (public.is_super_admin());

-- Function to auto-publish subdomain when subscription becomes active
CREATE OR REPLACE FUNCTION public.auto_publish_subdomain()
RETURNS TRIGGER AS $$
BEGIN
  -- When subscription becomes active, publish the subdomain
  IF NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status != 'active') THEN
    INSERT INTO public.organization_domains (organization_id, subdomain, is_published, published_at)
    VALUES (NEW.id, NEW.subdomain, true, NOW())
    ON CONFLICT (organization_id) 
    DO UPDATE SET is_published = true, published_at = NOW(), updated_at = NOW();
  END IF;
  
  -- When subscription is cancelled/suspended, unpublish
  IF NEW.subscription_status IN ('canceled', 'suspended') AND OLD.subscription_status = 'active' THEN
    UPDATE public.organization_domains 
    SET is_published = false, updated_at = NOW()
    WHERE organization_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-publish
DROP TRIGGER IF EXISTS trigger_auto_publish_subdomain ON public.organizations;
CREATE TRIGGER trigger_auto_publish_subdomain
  AFTER UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_publish_subdomain();

-- Function to check user limit before adding users
CREATE OR REPLACE FUNCTION public.check_organization_user_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_org RECORD;
  v_current_count INTEGER;
BEGIN
  -- Get organization details
  SELECT o.*, sp.max_users as plan_max_users
  INTO v_org
  FROM public.organizations o
  LEFT JOIN public.subscription_plans sp ON o.subscription_plan = sp.name
  WHERE o.id = NEW.organization_id;
  
  -- Get current user count
  SELECT COUNT(*) INTO v_current_count
  FROM public.profiles
  WHERE organization_id = NEW.organization_id AND is_active = true;
  
  -- Check if limit exceeded (skip if max_users is -1 meaning unlimited)
  IF v_org.max_users != -1 AND v_current_count >= v_org.max_users THEN
    RAISE EXCEPTION 'User limit reached for this organization. Current: %, Max: %. Please upgrade your subscription.', v_current_count, v_org.max_users;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to enforce user limits (on new profile creation)
DROP TRIGGER IF EXISTS trigger_check_user_limit ON public.profiles;
CREATE TRIGGER trigger_check_user_limit
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_organization_user_limit();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_subscription_metrics_org ON public.subscription_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_metrics_recorded ON public.subscription_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_organization_domains_subdomain ON public.organization_domains(subdomain);