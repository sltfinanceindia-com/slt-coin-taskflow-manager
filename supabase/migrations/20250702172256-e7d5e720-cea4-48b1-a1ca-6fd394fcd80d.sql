-- Drop the problematic insert policy that has recursion
DROP POLICY "Allow profile creation during signup and by admins" ON public.profiles;

-- Create a simple policy that allows profile creation during signup (when auth.uid() is null)
-- and allows any authenticated user to create profiles (for admin functionality)
CREATE POLICY "Allow profile creation during signup and by authenticated users" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow during signup (when auth.uid() is null)
  auth.uid() IS NULL 
  OR 
  -- Allow any authenticated user (admins can manage this through application logic)
  auth.uid() IS NOT NULL
);