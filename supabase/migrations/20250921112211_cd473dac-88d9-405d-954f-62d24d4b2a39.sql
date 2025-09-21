-- Fix call_history table to properly reference profiles
ALTER TABLE call_history 
DROP CONSTRAINT IF EXISTS call_history_caller_id_fkey,
DROP CONSTRAINT IF EXISTS call_history_receiver_id_fkey;

-- Add proper foreign key constraints
ALTER TABLE call_history 
ADD CONSTRAINT call_history_caller_id_fkey 
FOREIGN KEY (caller_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE call_history 
ADD CONSTRAINT call_history_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create function to get chat partner name for direct messages
CREATE OR REPLACE FUNCTION public.get_chat_partner_name(
  channel_id_param UUID,
  current_user_id UUID
)
RETURNS TABLE(partner_name TEXT, partner_role TEXT, partner_avatar TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.full_name,
    p.role::TEXT,
    p.avatar_url
  FROM public.communication_channels cc
  JOIN public.channel_members cm ON cc.id = cm.channel_id
  JOIN public.profiles p ON cm.user_id = p.id
  WHERE cc.id = channel_id_param 
    AND cc.is_direct_message = true
    AND p.id != current_user_id
  LIMIT 1;
END;
$$;