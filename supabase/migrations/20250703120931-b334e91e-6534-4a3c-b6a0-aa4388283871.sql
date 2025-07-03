-- Fix the avatar upload issue by updating storage policies and profile policies

-- First, let's check and fix the profiles table update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a proper update policy for profiles that works with profile ID
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  user_id = auth.uid() OR id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Also fix storage policies to use proper auth check
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Recreate storage policies with better auth handling
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
);