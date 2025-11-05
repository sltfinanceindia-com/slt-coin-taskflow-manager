-- Fix infinite recursion in user_roles policies
-- The issue is that the admin policy checks user_roles from within user_roles
-- We need to check against profiles table instead

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create new policies that check against profiles instead
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Also ensure chat_users table has proper RLS for viewing all active users
DROP POLICY IF EXISTS "Users can view all active chat users" ON public.chat_users;

CREATE POLICY "Users can view all active chat users"
ON public.chat_users
FOR SELECT
USING (is_active = true OR user_id IN (
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
));