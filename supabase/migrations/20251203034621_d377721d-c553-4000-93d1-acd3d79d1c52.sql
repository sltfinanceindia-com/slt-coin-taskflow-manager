-- =====================================================
-- ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR MULTI-TENANCY
-- =====================================================

-- Function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id 
  FROM public.profiles 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
  )
$$;

-- Function to check if user is org admin
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.user_id = auth.uid() 
    AND ur.role IN ('org_admin', 'admin')
    AND (_org_id IS NULL OR p.organization_id = _org_id)
  )
$$;

-- Function to check organization membership
CREATE OR REPLACE FUNCTION public.user_belongs_to_org(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND organization_id = _org_id
  )
$$;

-- Function to get organization's user count
CREATE OR REPLACE FUNCTION public.get_org_user_count(_org_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles
  WHERE organization_id = _org_id
  AND is_active = true
$$;

-- Function to check if org can add more users
CREATE OR REPLACE FUNCTION public.can_org_add_user(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    CASE 
      WHEN o.max_users = -1 THEN true
      ELSE public.get_org_user_count(_org_id) < o.max_users
    END
  FROM public.organizations o
  WHERE o.id = _org_id
$$;

-- =====================================================
-- RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Subscription Plans Policies
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Organizations Policies
CREATE POLICY "Super admins full access to organizations"
ON public.organizations FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view own organization"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_user_organization_id());

CREATE POLICY "Org admins can update own organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (id = public.get_user_organization_id() AND public.is_org_admin(id))
WITH CHECK (id = public.get_user_organization_id() AND public.is_org_admin(id));

-- Organization Invitations Policies
CREATE POLICY "Org admins can manage invitations"
ON public.organization_invitations FOR ALL
TO authenticated
USING (
  organization_id = public.get_user_organization_id() 
  AND (public.is_org_admin(organization_id) OR public.is_super_admin())
)
WITH CHECK (
  organization_id = public.get_user_organization_id() 
  AND (public.is_org_admin(organization_id) OR public.is_super_admin())
);

CREATE POLICY "Super admins can manage all invitations"
ON public.organization_invitations FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view invitations by email"
ON public.organization_invitations FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- =====================================================
-- DATA MIGRATION: CREATE DEFAULT ORG & MIGRATE DATA
-- =====================================================

DO $$
DECLARE
  default_org_id UUID;
  enterprise_plan_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get enterprise plan ID
  SELECT id INTO enterprise_plan_id FROM public.subscription_plans WHERE code = 'enterprise';
  
  -- Create default organization: SLT Finance India
  INSERT INTO public.organizations (
    name, 
    subdomain, 
    slug,
    description,
    subscription_plan_id,
    max_users,
    status,
    contact_email,
    primary_color,
    secondary_color
  ) VALUES (
    'SLT Finance India',
    'slt-finance',
    'slt-finance',
    'Original organization migrated from single-tenant setup',
    enterprise_plan_id,
    -1,
    'active',
    'admin@sltfinance.com',
    '#10b981',
    '#059669'
  )
  ON CONFLICT (subdomain) DO UPDATE SET updated_at = now()
  RETURNING id INTO default_org_id;
  
  RAISE NOTICE 'Organization ID: %', default_org_id;
  
  -- Migrate all tables to default organization
  UPDATE public.profiles SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.user_roles SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.training_sections SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.training_videos SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.training_assignments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.training_progress SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.training_video_progress SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.assessments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.assessment_questions SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.assessment_assignments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.assessment_attempts SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.assessment_answers SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.tasks SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.task_comments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.time_logs SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.coin_transactions SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.coin_rates SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.communication_channels SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.channel_members SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.channel_read_status SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.messages SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.message_attachments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.message_reactions SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.message_read_receipts SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.message_states SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.message_threads SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.groups SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.group_members SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.chat_users SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.session_logs SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.activity_logs SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.kanban_events SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.kanban_metrics SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.calendar_events SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.projects SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.admin_notes SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.file_attachments SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.notification_settings SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.daily_email_log SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.email_notifications SET organization_id = default_org_id WHERE organization_id IS NULL;
  UPDATE public.audit_logs SET organization_id = default_org_id WHERE organization_id IS NULL;
  
  -- Find first admin user and promote to super_admin
  SELECT user_id INTO admin_user_id 
  FROM public.profiles 
  WHERE role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Add super_admin role
    INSERT INTO public.user_roles (user_id, role, organization_id)
    VALUES (admin_user_id, 'super_admin', default_org_id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update organization created_by
    UPDATE public.organizations SET created_by = admin_user_id WHERE id = default_org_id;
    
    RAISE NOTICE 'Promoted user % to super_admin', admin_user_id;
  END IF;
  
  RAISE NOTICE 'Migration completed!';
END $$;

-- =====================================================
-- UPDATE HANDLE_NEW_USER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  org_id UUID;
  user_role_value public.app_role;
BEGIN
  -- Get organization_id from metadata or use default
  org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  
  -- If no org_id provided, get the default organization
  IF org_id IS NULL THEN
    SELECT id INTO org_id FROM public.organizations WHERE subdomain = 'slt-finance' LIMIT 1;
  END IF;
  
  -- Get role from metadata (default to 'intern')
  user_role_value := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.app_role, 
    'intern'::public.app_role
  );
  
  -- Insert into profiles with organization_id
  INSERT INTO public.profiles (
    id, 
    user_id, 
    full_name, 
    email,
    organization_id,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    org_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    organization_id = COALESCE(EXCLUDED.organization_id, public.profiles.organization_id),
    updated_at = NOW();
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role, organization_id)
  VALUES (NEW.id, user_role_value, org_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create chat_users entry
  INSERT INTO public.chat_users (user_id, status, organization_id)
  VALUES (NEW.id, 'offline', org_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;