-- Fix database functions with mutable search paths

-- Fix update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix update_user_roles_updated_at function
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_coin_rates_updated_at function
CREATE OR REPLACE FUNCTION public.update_coin_rates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix get_channel_display_name function
CREATE OR REPLACE FUNCTION public.get_channel_display_name(channel_id uuid, current_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  channel_record RECORD;
  other_user_name text;
BEGIN
  -- Get channel info
  SELECT * INTO channel_record
  FROM communication_channels
  WHERE id = channel_id;

  -- If not a DM, return the channel name
  IF NOT channel_record.is_direct_message THEN
    RETURN channel_record.name;
  END IF;

  -- For DM, get the other user's name
  SELECT p.full_name INTO other_user_name
  FROM profiles p
  WHERE p.id = ANY(channel_record.participant_ids)
    AND p.id != current_user_id
  LIMIT 1;

  RETURN COALESCE(other_user_name, 'Unknown User');
END;
$$;

-- Fix update_user_presence function
CREATE OR REPLACE FUNCTION public.update_user_presence(
  p_user_id uuid, 
  p_is_online boolean DEFAULT true, 
  p_status_message text DEFAULT NULL, 
  p_manual_status text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_presence (
    user_id,
    is_online,
    status_message,
    manual_status,
    last_seen,
    last_activity_at,
    activity_status
  )
  VALUES (
    p_user_id,
    p_is_online,
    p_status_message,
    p_manual_status,
    NOW(),
    NOW(),
    CASE 
      WHEN p_manual_status = 'busy' THEN 'busy'
      WHEN p_manual_status = 'away' THEN 'away'
      WHEN p_is_online THEN 'online'
      ELSE 'offline'
    END
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    is_online = p_is_online,
    status_message = COALESCE(p_status_message, user_presence.status_message),
    manual_status = p_manual_status,
    last_seen = NOW(),
    last_activity_at = NOW(),
    activity_status = CASE 
      WHEN p_manual_status = 'busy' THEN 'busy'
      WHEN p_manual_status = 'away' THEN 'away'
      WHEN p_is_online THEN 'online'
      ELSE 'offline'
    END,
    updated_at = NOW();
END;
$$;