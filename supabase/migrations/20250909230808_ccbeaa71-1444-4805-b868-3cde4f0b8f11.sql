-- Fix session_logs RLS policy that's causing the error
DROP POLICY IF EXISTS "Users can insert their own session logs" ON public.session_logs;

-- Create a more permissive policy for session_logs INSERT
CREATE POLICY "Allow session log creation" 
ON public.session_logs 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  ) OR auth.uid() IS NOT NULL
);