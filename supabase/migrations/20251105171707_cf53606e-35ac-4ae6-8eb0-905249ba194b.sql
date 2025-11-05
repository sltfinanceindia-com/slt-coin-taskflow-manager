-- Create trigger to cleanup deactivated user data
CREATE OR REPLACE FUNCTION cleanup_deactivated_user_channels()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only run if user is being deactivated
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    -- Delete direct message channels where the deactivated user is a participant
    DELETE FROM public.communication_channels
    WHERE is_direct_message = TRUE
      AND NEW.id = ANY(participant_ids);
    
    -- Remove from group channels
    DELETE FROM public.channel_members
    WHERE user_id = NEW.id;
    
    -- Update chat_users status
    UPDATE public.chat_users
    SET status = 'offline',
        is_active = false
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_user_deactivated ON public.profiles;
CREATE TRIGGER on_user_deactivated
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_deactivated_user_channels();