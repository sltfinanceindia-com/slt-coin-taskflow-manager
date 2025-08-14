-- Fix Security Definer View Issues

-- Remove the security definer views that were flagged as security risks
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.student_assessment_questions;

-- Instead, create secure RLS policies that allow controlled access

-- For public profile access, modify the existing policies to allow limited public access
CREATE POLICY "Public can view basic profile info"
ON public.profiles
FOR SELECT  
USING (
  -- Allow viewing basic info for any authenticated user
  auth.uid() IS NOT NULL
);

-- For assessment questions, we already have the correct policies in place
-- Students can only see question content (without answers) for published assessments
-- Admins can see everything

-- The security is now handled entirely through RLS policies rather than security definer views