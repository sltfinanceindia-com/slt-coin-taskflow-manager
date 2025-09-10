-- Enhance user_presence table for better status tracking
ALTER TABLE public.user_presence 
ADD COLUMN IF NOT EXISTS activity_status TEXT DEFAULT 'online',
ADD COLUMN IF NOT EXISTS manual_status TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create direct message channels automatically
CREATE OR REPLACE FUNCTION create_direct_message_channel(user1_id UUID, user2_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  channel_id UUID;
  existing_channel_id UUID;
BEGIN
  -- Check if direct message channel already exists between these users
  SELECT cc.id INTO existing_channel_id
  FROM public.communication_channels cc
  JOIN public.channel_members cm1 ON cc.id = cm1.channel_id
  JOIN public.channel_members cm2 ON cc.id = cm2.channel_id
  WHERE cc.is_direct_message = true 
    AND cm1.user_id = user1_id 
    AND cm2.user_id = user2_id
    AND cc.member_count = 2;
    
  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;
  
  -- Create new direct message channel
  INSERT INTO public.communication_channels (
    name, 
    description, 
    type, 
    is_direct_message, 
    member_count,
    created_by,
    participant_ids
  ) VALUES (
    'Direct Message',
    'Direct message between users',
    'private',
    true,
    2,
    user1_id,
    ARRAY[user1_id, user2_id]
  ) RETURNING id INTO channel_id;
  
  -- Add both users to the channel
  INSERT INTO public.channel_members (channel_id, user_id) VALUES 
    (channel_id, user1_id),
    (channel_id, user2_id);
    
  RETURN channel_id;
END;
$$;

-- Function to update user presence and activity
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_is_online BOOLEAN DEFAULT true,
  p_status_message TEXT DEFAULT NULL,
  p_manual_status TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_presence (
    user_id, 
    is_online, 
    status_message, 
    manual_status,
    activity_status,
    last_activity_at,
    last_seen
  ) VALUES (
    p_user_id,
    p_is_online,
    p_status_message,
    p_manual_status,
    CASE WHEN p_is_online THEN 'online' ELSE 'offline' END,
    now(),
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    is_online = EXCLUDED.is_online,
    status_message = COALESCE(EXCLUDED.status_message, user_presence.status_message),
    manual_status = COALESCE(EXCLUDED.manual_status, user_presence.manual_status),
    activity_status = CASE 
      WHEN EXCLUDED.is_online THEN 'online'
      WHEN user_presence.last_activity_at < now() - INTERVAL '1 hour' THEN 'offline'
      ELSE 'away'
    END,
    last_activity_at = CASE WHEN EXCLUDED.is_online THEN now() ELSE user_presence.last_activity_at END,
    last_seen = CASE WHEN NOT EXCLUDED.is_online THEN now() ELSE user_presence.last_seen END,
    updated_at = now();
END;
$$;