-- Fix infinite recursion in channel_members RLS policies
DROP POLICY IF EXISTS "Users can view channel memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON public.channel_members;

-- Create new policies without recursion
CREATE POLICY "Users can view channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join channels" 
ON public.channel_members 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage channel memberships" 
ON public.channel_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Also fix communication_channels policies to avoid recursion
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.communication_channels;

CREATE POLICY "Users can view channels they are members of" 
ON public.communication_channels 
FOR SELECT 
USING (true);

-- Create default general channel if none exists
INSERT INTO public.communication_channels (name, description, type, created_by)
SELECT 'General', 'General discussion channel', 'public', (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.communication_channels WHERE name = 'General');

-- Add all users to the general channel
INSERT INTO public.channel_members (channel_id, user_id)
SELECT 
  (SELECT id FROM public.communication_channels WHERE name = 'General' LIMIT 1),
  profiles.id
FROM public.profiles
WHERE NOT EXISTS (
  SELECT 1 FROM public.channel_members 
  WHERE channel_id = (SELECT id FROM public.communication_channels WHERE name = 'General' LIMIT 1)
  AND user_id = profiles.id
);