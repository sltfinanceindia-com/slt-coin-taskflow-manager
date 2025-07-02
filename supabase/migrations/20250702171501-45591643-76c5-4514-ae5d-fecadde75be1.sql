-- Drop the restrictive insert policy that blocks signup
DROP POLICY "Admins can insert profiles" ON public.profiles;

-- Create a new policy that allows profile creation during signup
-- This allows the trigger to create profiles when auth.uid() is null (during signup)
-- and still allows admins to create profiles manually
CREATE POLICY "Allow profile creation during signup and by admins" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow during signup (when auth.uid() is null)
  auth.uid() IS NULL 
  OR 
  -- Allow admins to create profiles manually
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  )
);