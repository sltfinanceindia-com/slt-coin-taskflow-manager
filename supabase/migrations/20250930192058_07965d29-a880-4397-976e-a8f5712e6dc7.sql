-- Create or replace function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_is_online BOOLEAN DEFAULT TRUE,
  p_status_message TEXT DEFAULT NULL,
  p_manual_status TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Enable realtime for call_history (only if not already in publication)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'call_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE call_history;
  END IF;
END $$;

-- Enable realtime for messages (only if not already in publication)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;