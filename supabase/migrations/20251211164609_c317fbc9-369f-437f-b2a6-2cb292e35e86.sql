-- Phase 1: Create helper function for organization ID lookup
CREATE OR REPLACE FUNCTION public.get_user_org_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE user_id = user_uuid LIMIT 1
$$;

-- Drop existing complex RLS policies on communication_channels
DROP POLICY IF EXISTS "Users can view their channels" ON communication_channels;
DROP POLICY IF EXISTS "Users can create channels" ON communication_channels;
DROP POLICY IF EXISTS "channels_select_policy" ON communication_channels;
DROP POLICY IF EXISTS "channels_insert_policy" ON communication_channels;

-- Create simple org-based policies for communication_channels
CREATE POLICY "channels_org_select" ON communication_channels
FOR SELECT TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channels_org_insert" ON communication_channels
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channels_org_update" ON communication_channels
FOR UPDATE TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channels_org_delete" ON communication_channels
FOR DELETE TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

-- Drop existing complex RLS policies on channel_members
DROP POLICY IF EXISTS "Users can view channel memberships" ON channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
DROP POLICY IF EXISTS "Admins can manage channel memberships" ON channel_members;
DROP POLICY IF EXISTS "channel_members_select_policy" ON channel_members;
DROP POLICY IF EXISTS "channel_members_insert_policy" ON channel_members;

-- Create simple org-based policies for channel_members
CREATE POLICY "channel_members_org_select" ON channel_members
FOR SELECT TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channel_members_org_insert" ON channel_members
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channel_members_org_update" ON channel_members
FOR UPDATE TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "channel_members_org_delete" ON channel_members
FOR DELETE TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

-- Drop existing complex RLS policies on messages
DROP POLICY IF EXISTS "Users can view messages in their channels" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON messages;

-- Create simple org-based policies for messages
CREATE POLICY "messages_org_select" ON messages
FOR SELECT TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "messages_org_insert" ON messages
FOR INSERT TO authenticated
WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "messages_org_update" ON messages
FOR UPDATE TO authenticated
USING (organization_id = public.get_user_org_id(auth.uid()));

-- Update create_direct_message_channel function to be more robust
CREATE OR REPLACE FUNCTION public.create_direct_message_channel(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  channel_id UUID;
  existing_channel_id UUID;
  org_id UUID;
BEGIN
  -- Get organization_id from user1's profile
  SELECT organization_id INTO org_id FROM public.profiles WHERE id = user1_id;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'User not found or has no organization';
  END IF;
  
  -- Check if direct message channel already exists between these users
  SELECT cc.id INTO existing_channel_id
  FROM public.communication_channels cc
  WHERE cc.is_direct_message = true 
    AND cc.organization_id = org_id
    AND cc.participant_ids @> ARRAY[user1_id, user2_id]
    AND cc.member_count = 2
  LIMIT 1;
    
  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;
  
  -- Create new direct message channel
  INSERT INTO public.communication_channels (
    name, description, type, is_direct_message, member_count,
    created_by, participant_ids, organization_id
  ) VALUES (
    'Direct Message', 'Direct message between users', 'private',
    true, 2, user1_id, ARRAY[user1_id, user2_id], org_id
  ) RETURNING id INTO channel_id;
  
  -- Add both users to the channel
  INSERT INTO public.channel_members (channel_id, user_id, organization_id) VALUES 
    (channel_id, user1_id, org_id),
    (channel_id, user2_id, org_id);
    
  RETURN channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_comm_channels_org ON communication_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_org ON channel_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_messages_org ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_org ON profiles(user_id, organization_id);