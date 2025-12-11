-- Create helper functions for communication (SECURITY DEFINER to bypass complex RLS)

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Function to get user's channel IDs
CREATE OR REPLACE FUNCTION public.get_user_channel_ids(p_profile_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(channel_id), ARRAY[]::uuid[])
  FROM channel_members
  WHERE user_id = p_profile_id
$$;

-- Function to check if user is member of a channel
CREATE OR REPLACE FUNCTION public.is_channel_member(p_channel_id uuid, p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = p_channel_id AND user_id = p_profile_id
  )
$$;

-- Drop existing problematic policies on communication_channels
DROP POLICY IF EXISTS "Users can view their channels only" ON communication_channels;
DROP POLICY IF EXISTS "Users can view their channels" ON communication_channels;
DROP POLICY IF EXISTS "Channel members can view channels" ON communication_channels;

-- Create simplified SELECT policy using helper function
CREATE POLICY "Users can view their channels" ON communication_channels
FOR SELECT TO authenticated
USING (
  public.is_channel_member(id, public.get_current_profile_id())
  OR created_by = public.get_current_profile_id()
  OR organization_id = public.get_user_organization_id()
);

-- Drop and recreate channel_members policies
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;
DROP POLICY IF EXISTS "Channel members can view memberships" ON channel_members;
DROP POLICY IF EXISTS "Users can view channel memberships" ON channel_members;

CREATE POLICY "Users can view channel memberships" ON channel_members
FOR SELECT TO authenticated
USING (
  user_id = public.get_current_profile_id()
  OR organization_id = public.get_user_organization_id()
);

-- Drop and recreate messages policies for better performance
DROP POLICY IF EXISTS "Users can view messages in their channels" ON messages;
DROP POLICY IF EXISTS "Channel members can view messages" ON messages;

CREATE POLICY "Users can view messages in their channels" ON messages
FOR SELECT TO authenticated
USING (
  public.is_channel_member(channel_id, public.get_current_profile_id())
  OR sender_id = public.get_current_profile_id()
  OR receiver_id = public.get_current_profile_id()
  OR organization_id = public.get_user_organization_id()
);

-- Create index for faster channel member lookups
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_organization_id ON messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_organization_id ON communication_channels(organization_id);