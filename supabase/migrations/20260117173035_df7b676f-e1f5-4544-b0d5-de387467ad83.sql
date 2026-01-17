-- Fix infinite recursion in group_members RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members for their groups" ON public.group_members;

-- Create a security definer function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    INNER JOIN public.profiles p ON p.id = gm.user_id
    WHERE p.user_id = _user_id
      AND gm.group_id = _group_id
  )
$$;

-- Create a function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    INNER JOIN public.profiles p ON p.id = gm.user_id
    WHERE p.user_id = _user_id
      AND gm.group_id = _group_id
      AND gm.role = 'admin'
  )
$$;

-- Create has_role function for role checking (best practice)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Create non-recursive policies for group_members
CREATE POLICY "Users can view their group memberships"
ON public.group_members
FOR SELECT
USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR public.is_group_member(auth.uid(), group_id)
);

CREATE POLICY "Group admins can manage members"
ON public.group_members
FOR ALL
USING (public.is_group_admin(auth.uid(), group_id))
WITH CHECK (public.is_group_admin(auth.uid(), group_id));

-- Fix search_path for is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND role IN ('admin', 'org_admin', 'super_admin')
  )
$$;