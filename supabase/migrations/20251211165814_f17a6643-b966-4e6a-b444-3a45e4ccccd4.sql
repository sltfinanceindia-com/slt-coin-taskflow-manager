-- Communication System Cleanup & Optimization Migration
-- Drop any duplicate/conflicting RLS policies first

-- Drop existing communication policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop policies on communication_channels
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'communication_channels' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON communication_channels', pol.policyname);
  END LOOP;
  
  -- Drop policies on channel_members
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'channel_members' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON channel_members', pol.policyname);
  END LOOP;
  
  -- Drop policies on messages
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'messages' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
  END LOOP;
END $$;

-- Create optimized helper function for getting user org
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Create optimized helper function for getting user profile id
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Simple RLS policies using the optimized functions

-- communication_channels policies
CREATE POLICY "channels_select_org" 
ON public.communication_channels 
FOR SELECT 
TO authenticated
USING (organization_id = public.get_my_org_id());

CREATE POLICY "channels_insert_org" 
ON public.communication_channels 
FOR INSERT 
TO authenticated
WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "channels_update_org" 
ON public.communication_channels 
FOR UPDATE 
TO authenticated
USING (organization_id = public.get_my_org_id());

CREATE POLICY "channels_delete_creator" 
ON public.communication_channels 
FOR DELETE 
TO authenticated
USING (created_by = public.get_my_profile_id());

-- channel_members policies
CREATE POLICY "channel_members_select_org" 
ON public.channel_members 
FOR SELECT 
TO authenticated
USING (organization_id = public.get_my_org_id());

CREATE POLICY "channel_members_insert_org" 
ON public.channel_members 
FOR INSERT 
TO authenticated
WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "channel_members_delete_org" 
ON public.channel_members 
FOR DELETE 
TO authenticated
USING (organization_id = public.get_my_org_id());

-- messages policies
CREATE POLICY "messages_select_org" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (organization_id = public.get_my_org_id());

CREATE POLICY "messages_insert_org" 
ON public.messages 
FOR INSERT 
TO authenticated
WITH CHECK (organization_id = public.get_my_org_id());

CREATE POLICY "messages_update_sender" 
ON public.messages 
FOR UPDATE 
TO authenticated
USING (sender_id = public.get_my_profile_id());

CREATE POLICY "messages_delete_sender" 
ON public.messages 
FOR DELETE 
TO authenticated
USING (sender_id = public.get_my_profile_id());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_members_user_org 
ON public.channel_members(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_channels_org_lastmsg 
ON public.communication_channels(organization_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_channel_created 
ON public.messages(channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_org 
ON public.messages(organization_id);