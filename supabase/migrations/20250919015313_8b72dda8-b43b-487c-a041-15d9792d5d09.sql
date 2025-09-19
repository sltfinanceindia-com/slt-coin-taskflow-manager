-- Update profiles RLS policy to allow all authenticated users to view all profiles for communication
-- This is necessary for team communication features

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles for communication" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Keep the admin policy for broader access
-- The existing "Admins can view all profiles" policy can stay as is

-- Ensure user_presence is accessible to all authenticated users for communication status
-- Update the existing policy to be more permissive for communication needs
DROP POLICY IF EXISTS "Users can view all presence status" ON public.user_presence;

CREATE POLICY "Authenticated users can view all presence status" 
ON public.user_presence 
FOR SELECT 
USING (auth.uid() IS NOT NULL);