-- Fix the cleanup trigger to delete in correct order
CREATE OR REPLACE FUNCTION cleanup_deactivated_user_channels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only run if user is being deactivated
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    
    -- Step 1: Remove user from ALL channel memberships first (child records)
    DELETE FROM public.channel_members
    WHERE user_id = NEW.id;
    
    -- Step 2: Now delete direct message channels where user was a participant (parent records)
    -- Only delete channels where this user was one of the participants
    DELETE FROM public.communication_channels
    WHERE is_direct_message = TRUE
      AND NEW.id = ANY(participant_ids);
    
    -- Step 3: Update chat_users status
    UPDATE public.chat_users
    SET status = 'offline',
        is_active = false
    WHERE user_id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;