-- Drop and recreate get_channel_display_name with correct parameter names
DROP FUNCTION IF EXISTS public.get_channel_display_name(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_channel_display_name(p_channel_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_channel RECORD;
  v_partner_name TEXT;
BEGIN
  SELECT * INTO v_channel FROM communication_channels WHERE id = p_channel_id;
  
  IF v_channel.is_direct_message THEN
    SELECT p.full_name INTO v_partner_name
    FROM channel_members cm
    JOIN profiles p ON p.id = cm.user_id
    WHERE cm.channel_id = p_channel_id AND cm.user_id != p_user_id
    LIMIT 1;
    RETURN COALESCE(v_partner_name, 'Unknown');
  END IF;
  
  RETURN v_channel.name;
END;
$$;

-- Also add search_path to increment_user_coins with admin check
DROP FUNCTION IF EXISTS public.increment_user_coins(uuid, integer);

CREATE OR REPLACE FUNCTION public.increment_user_coins(p_user_id uuid, p_coins integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify caller is admin before allowing coin increment
  IF NOT public.is_any_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can increment user coins';
  END IF;
  
  UPDATE profiles 
  SET total_coins = COALESCE(total_coins, 0) + p_coins
  WHERE id = p_user_id;
END;
$$;