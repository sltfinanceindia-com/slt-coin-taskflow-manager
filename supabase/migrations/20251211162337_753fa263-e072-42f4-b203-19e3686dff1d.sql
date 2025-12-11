-- Drop and recreate the create_direct_message_channel function with proper organization_id handling
DROP FUNCTION IF EXISTS public.create_direct_message_channel(uuid, uuid);

CREATE OR REPLACE FUNCTION public.create_direct_message_channel(user1_id UUID, user2_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  channel_id UUID;
  existing_channel_id UUID;
  org_id UUID;
  user2_name TEXT;
BEGIN
  -- Get organization_id from user1's profile
  SELECT organization_id INTO org_id FROM profiles WHERE id = user1_id;
  
  -- Get user2's name for the channel
  SELECT full_name INTO user2_name FROM profiles WHERE id = user2_id;
  
  -- Check if direct message channel already exists between these two users
  SELECT cc.id INTO existing_channel_id
  FROM communication_channels cc
  WHERE cc.is_direct_message = true 
    AND cc.participant_ids @> ARRAY[user1_id]::uuid[]
    AND cc.participant_ids @> ARRAY[user2_id]::uuid[]
    AND array_length(cc.participant_ids, 1) = 2;
    
  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;
  
  -- Create new direct message channel WITH organization_id
  INSERT INTO communication_channels (
    name, 
    description, 
    type, 
    is_direct_message, 
    member_count,
    created_by, 
    participant_ids, 
    organization_id
  ) VALUES (
    COALESCE(user2_name, 'Direct Message'), 
    'Direct message between users', 
    'private',
    true, 
    2, 
    user1_id, 
    ARRAY[user1_id, user2_id], 
    org_id
  ) RETURNING id INTO channel_id;
  
  -- Add both users to the channel WITH organization_id
  INSERT INTO channel_members (channel_id, user_id, organization_id) 
  VALUES 
    (channel_id, user1_id, org_id),
    (channel_id, user2_id, org_id);
    
  RETURN channel_id;
END;
$$;

-- Simplify channel_members RLS policy for better performance
DROP POLICY IF EXISTS "Users can view channel memberships" ON channel_members;

CREATE POLICY "Users can view channel memberships" ON channel_members
FOR SELECT TO authenticated
USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
);

-- Simplify communication_channels RLS policy
DROP POLICY IF EXISTS "Users can view their channels" ON communication_channels;

CREATE POLICY "Users can view their channels" ON communication_channels
FOR SELECT TO authenticated
USING (
  created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR organization_id IN (SELECT organization_id FROM profiles WHERE user_id = auth.uid())
  OR id IN (
    SELECT channel_id FROM channel_members 
    WHERE user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
);

-- Create index for faster channel_members lookups
CREATE INDEX IF NOT EXISTS idx_channel_members_user_org ON channel_members(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_communication_channels_org ON communication_channels(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);